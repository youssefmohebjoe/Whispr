import nodemailer from 'nodemailer'


export const subjectTypes = {
    confirmEmail: "Confirm-Email",
    resetPassword: "Reset-Password",
    updateEmail: "Update-Email",

}

export const sendEmail = async (
    {
        to = [],
        cc = [],
        bcc = [],
        subject = "Whispr",
        text = "",
        html = "",
        attachments = [],
    } = {}
) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const info = await transporter.sendMail({
        from: `"Whispr" <${process.env.EMAIL}>`, // sender address
        to,
        cc,
        bcc,
        subject,
        text,
        html,
        attachments,
    });

    console.log("Message sent: %s", info.messageId);
}
