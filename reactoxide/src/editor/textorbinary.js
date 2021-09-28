import {isText, isBinary, getEncoding} from 'istextorbinary/edition-es2019/index'

const isBinaryJs = (data) => {
    return isBinary(null, data)
}

const getEncodingJs = (data) => {
    return getEncoding(data)
}

export {isBinaryJs, getEncodingJs}

