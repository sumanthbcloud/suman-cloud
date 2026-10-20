package com.suman.cloud.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.ses.model.Body;
import software.amazon.awssdk.services.ses.model.Content;
import software.amazon.awssdk.services.ses.model.Destination;
import software.amazon.awssdk.services.ses.model.Message;
import software.amazon.awssdk.services.ses.model.SendEmailRequest;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${app.aws.region:us-east-1}")
    private String awsRegion;

    @Value("${app.aws.ses-from-email:noreply@suman.cloud}")
    private String fromEmail;

    private SesClient testSesClient;

    public EmailService() {
    }

    EmailService(String awsRegion, String fromEmail, SesClient testSesClient) {
        this.awsRegion = awsRegion;
        this.fromEmail = fromEmail;
        this.testSesClient = testSesClient;
    }

    public void sendOtp(String toEmail, String otpCode) {
        String subject = "SUMAN verification code";
        String body = "Your SUMAN verification code is: " + otpCode + "\n\nThis code expires in 10 minutes.";

        try {
            SesClient sesClient = testSesClient != null ? testSesClient : SesClient.builder().region(Region.of(awsRegion)).build();
            try {
                SendEmailRequest request = SendEmailRequest.builder()
                        .source(fromEmail)
                        .destination(Destination.builder().toAddresses(toEmail).build())
                        .message(Message.builder()
                                .subject(Content.builder().data(subject).build())
                                .body(Body.builder()
                                        .text(Content.builder().data(body).build())
                                        .build())
                                .build())
                        .build();

                sesClient.sendEmail(request);
                log.info("Verification OTP email sent via SES to: {}", toEmail);
            } finally {
                if (testSesClient == null) {
                    sesClient.close();
                }
            }
        } catch (Exception e) {
            log.error("Failed to send OTP verification email via SES to {}: {}", toEmail, e.getMessage());
            throw new IllegalStateException("Failed to send verification email. Check Amazon SES configuration.");
        }
    }
}
