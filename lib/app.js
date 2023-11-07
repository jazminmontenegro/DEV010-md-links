const path = require('path'); // trabaja con las rutas de archivos y directorios
const {marked} = require('marked'); // analiza texto markdrown  extrae informacion de enlaces y otros contenidos 
const fetch = require('node-fetch');
const fs = require('fs');
const { error } = require('console');
// funcion para obtener la ruta absoluta y le estencion del archivo
const validMarkdownExtensions = [
  '.md', '.mkd', '.mdwn', '.mdown', '.mdtxt', '.mdtext', '.markdown', '.text', '.mardrown', '.mdx',
]; 

const getAbsoluteExtension = (filePath)=> {
       // Convierte la ruta en absoluta.
       const absolutePath = path.resolve(filePath);
       // Obtiene la extensión del archivo.
       const extname = path.extname(absolutePath);
       return {absolutePath, extname}
}

// Función para procesar el contenido Markdown y extraer enlaces

const processMarkdownContent = (markdownContent, absolutePath) => {
  const renderer = new marked.Renderer();
  const links = [];
  renderer.link = (href, title, text) => {
    if (!href.startsWith('#') && !href.startsWith('./')) {
      // Filtrar enlaces locales que comienzan con '#' o './'
      links.push({ href, text, file: absolutePath });
    }
  };
    marked(markdownContent, { renderer });
    if (links.length === 0) {
    return Promise.reject('No hay enlaces en el archivo Markdown.');
  }
    return  links;
};


  //funcion para valiadar status, ok y link tambien se utilizo operadores ternearios para http 

  const validateLinks = (links) => {
    return Promise.all(
      links.filter(link => /^(http|https)\:\/\//.test(link.href))
        .map((link) => { 
          return fetch(link.href)
            .then((response) => {
              link.status = response.status;
              link.ok = response.ok ? 'ok' : 'fail';
              return link;
            })
            .catch(() => {
              link.status = 500;
              link.ok = 'fail';
              return link;
            });
        })
    )
    .then((validatedLinks) => {
      const summary = {
        ok: validatedLinks.filter(link => link.ok === 'ok').length,
        fail: validatedLinks.filter(link => link.ok === 'fail').length,
      };
      return { links: validatedLinks, summary };
    });
  };

  
  
//funcion para leer directorios u unir las rutas

const readDirectory = (directory, validate) => {
  const files = fs.readdirSync(directory);

  // Filtrar los archivos Markdown
  const markdownFiles = files.filter((file) => {
    const extname = path.extname(file);
    return validMarkdownExtensions.includes(extname);
  });

  if (markdownFiles.length === 0) {
    // No hay archivos Markdown en el directorio, por lo que no es necesario continuar.
    return Promise.resolve([]);
  }

  // Promesa que resuelve todos los enlaces validados
  const validateAllLinks = Promise.all(
    markdownFiles.map((file) => {
      const absoluteFilePath = path.join(directory, file);
      const markdownContent = fs.readFileSync(absoluteFilePath, 'utf8');
      const links = processMarkdownContent(markdownContent, absoluteFilePath);

      if (validate) {
        return validateLinks(links)
        .then((resLinks) => resLinks.links)
       
      } else {
        // Filtrar los enlaces que comienzan con 'http' o 'https'
        const httpLinks = links.filter(link => link.href && (link.href.startsWith('http://') || link.href.startsWith('https://')));
        return httpLinks ; // Devolver una matriz plana de enlaces HTTP/HTTPS
      }
    })
  );

  return validateAllLinks
    .then((results) => {
      const allLinks = results.flat(); // Aplanar el array de arrays de enlaces
      const summary = {
        ok: allLinks.filter(link => link.ok === 'ok').length,
        fail: allLinks.filter(link => link.ok === 'fail').length,
      };


      return { links: allLinks, summary };
    });
};


  
  module.exports = {
    getAbsoluteExtension, 
    processMarkdownContent,
    validateLinks,
    readDirectory
    }