/**
 * URL Helper utility for generating complete URLs
 */

/**
 * Get the base URL based on environment
 * @returns {string} Base URL
 */
const getBaseURL = () => {
    if (process.env.NODE_ENV === 'production') {
        return process.env.API_BASE_URL_PRODUCTION || 'https://api.jivbook.com';
    }
    return process.env.API_BASE_URL_DEVELOPMENT || `http://localhost:${process.env.PORT || 3010}`;
};

/**
 * Convert relative file path to complete URL
 * @param {string} filePath - Relative file path (e.g., 'uploads/sliders/image.jpg')
 * @returns {string} Complete URL
 */
const getCompleteImageURL = (filePath) => {
    if (!filePath) return null;
    
    // If already a complete URL, return as is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath;
    }
    
    const baseURL = getBaseURL();
    
    // Remove leading slash if present and ensure it starts with uploads
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const finalPath = cleanPath.startsWith('uploads/') ? cleanPath : `uploads/${cleanPath}`;
    
    return `${baseURL}/${finalPath}`;
};

/**
 * Convert multiple file paths to complete URLs
 * @param {string[]} filePaths - Array of relative file paths
 * @returns {string[]} Array of complete URLs
 */
const getCompleteImageURLs = (filePaths) => {
    if (!Array.isArray(filePaths)) return [];
    return filePaths.map(path => getCompleteImageURL(path)).filter(url => url !== null);
};

/**
 * Add complete URLs to object with image fields
 * @param {Object} obj - Object containing image fields
 * @param {string[]} imageFields - Array of field names that contain image paths
 * @returns {Object} Object with complete URLs
 */
const addCompleteURLsToObject = (obj, imageFields = []) => {
    if (!obj) return obj;
    
    const result = { ...obj };
    
    imageFields.forEach(field => {
        if (result[field]) {
            if (Array.isArray(result[field])) {
                result[field] = getCompleteImageURLs(result[field]);
            } else {
                result[field] = getCompleteImageURL(result[field]);
            }
        }
    });
    
    return result;
};

/**
 * Transform Mongoose document to include complete URLs
 * @param {Object} doc - Mongoose document
 * @param {string[]} imageFields - Array of field names that contain image paths
 * @returns {Object} Transformed object with complete URLs
 */
const transformDocumentWithURLs = (doc, imageFields = []) => {
    if (!doc) return doc;
    
    // Convert to plain object if it's a Mongoose document
    const plainObj = doc.toObject ? doc.toObject() : doc;
    
    return addCompleteURLsToObject(plainObj, imageFields);
};

module.exports = {
    getBaseURL,
    getCompleteImageURL,
    getCompleteImageURLs,
    addCompleteURLsToObject,
    transformDocumentWithURLs
};
