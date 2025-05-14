import { EventEmitter } from 'node:events'
import { nanoid, customAlphabet } from 'nanoid';
import { sendEmail, subjectTypes } from '../email/send.email.js';
import { verificationEmailTemplate } from '../email/template/verification.email.js';
import { userModel } from '../../DB/model/User.model.js';
import { generateHash } from '../security/hash.security.js';
import * as dbService from "../../DB/db.service.js"
export const emailEvent = new EventEmitter({})

const sendCode = async ({ data, subject = subjectTypes.confirmEmail } = {}) => {
    const { id, email } = data;
    const otp = customAlphabet("0123456789", 6)()
    const html = verificationEmailTemplate({ code: otp })
    const hash = generateHash({ plainText: otp })
    let dataUpdate = {};
    switch (subject) {
        case subjectTypes.confirmEmail:
            dataUpdate = { emailOTP: hash }
            break;

        case subjectTypes.resetPassword:
            dataUpdate = { forgetPasswordOTP: hash }
            break;

        case subjectTypes.updateEmail:
            dataUpdate = { updateEmailOTP: hash }
            break;

        default:
            break;
    }
    await dbService.updateOne({
        model: userModel,
        filter: { _id: id },
        data: dataUpdate
    })
    await sendEmail({ to: email, subject, html })
}

emailEvent.on("sendConfirmEmail", async (data) => {
    await sendCode({ data, subject: subjectTypes.confirmEmail })
})

emailEvent.on("updateEmail", async (data) => {
    await sendCode({ data, subject: subjectTypes.updateEmail })
})

emailEvent.on("sendForgetPassword", async (data) => {
    await sendCode({ data, subject: subjectTypes.resetPassword })

})