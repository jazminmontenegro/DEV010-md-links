const fs = require('fs');
const { getAbsoluteExtension, processMarkdownContent, validateLinks,readDirectory } = require('./lib/app.js');
const { rejects } = require('assert');
const validMarkdownExtensions = [
  '.md', '.mkd', '.mdwn', '.mdown', '.mdtxt', '.mdtext', '.markdown', '.text', '.mardrown', '.mdx',
];

const mdLinks = (filePath, validate = false) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      const { absolutePath, extname } = getAbsoluteExtension(filePath);

      if (fs.statSync(filePath).isDirectory()) {
        // Usar la función readDirectory para procesar directorios
        const allLinks = readDirectory(filePath, validate);
        resolve(allLinks);
      } else if (validMarkdownExtensions.includes(extname)) {
        // El archivo es de tipo Markdown, continúa con la lectura.
        fs.promises
          .readFile(absolutePath, 'utf8')
          .then((markdownContent) => {
            const links = processMarkdownContent(markdownContent, absolutePath);
            if (validate) {
              return validateLinks(links);
            } else {
              return links;
            }
          })
          .then((result) => {
            resolve(result);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        reject('La ruta no es ni un archivo ni un directorio válido');
      }
    } else {
      reject('La ruta no existe');
    }
  })
};


module.exports = mdLinks;
