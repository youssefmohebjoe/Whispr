import path from "node:path"
import fs from "node:fs"
import multer from "multer"

export const fileValidationTypes = {
    image: ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'],
    document: ['application/pdf', 'application/msword', 'application/json', 'application/vnd.openxmlformats-officed']
}

export const uploadDiskFile = (customPath = "general", fileValidation = []) => {

    const basePath = `uploads/${customPath}`
    const fullPath = path.resolve(`./src/${basePath}`)

    console.log({ fullPath, basePath });
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true })
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, fullPath)
        },
        filename: (req, file, cb) => {
            console.log({ file });
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            file.finalPath = basePath + "/" + uniqueSuffix + '-' + file.originalname
            cb(null, uniqueSuffix + '-' + file.originalname)
        },
    })

    function fileFilter(req, file, cb) {
        if (fileValidation.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb('Invalid file format', false)

        }

    }

    return multer({ dest: 'default-upload', fileFilter, storage })
}