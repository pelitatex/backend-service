import { createHash } from "crypto";

const checkMD5 = (password, hashedPassword) => {
    const md5Hash = createHash('md5').update(password).digest('hex');
    return md5Hash === hashedPassword;
}

const generateMD5 = (password) => {
    const md5Hash = createHash('md5').update(password).digest('hex');
    return md5Hash;
}

export default {checkMD5, generateMD5}