const mdLinks = require('../index');
const {processMarkdownContent} = require('../lib/app');
const { validateLinks } = require('../lib/app.js');
const fetch = require('node-fetch');

jest.mock('node-fetch');


describe('mdLinks', () => {
  it('deberia devolver una promesa', () => {
    const result = mdLinks('example/Markdown.md')
    expect(result).toBeInstanceOf(Promise); // es un matcher coparador que verifica sin un valor es una istancia de clase o construtor
  });
  it('debería rechazar la promesa si la ruta no existe', () => {
    const result = mdLinks('docs/Markdown1.md');
    return expect(result).rejects.toMatch('La ruta no existe'); //reject que se rechace toMatch se utiliza para el motivo de rechazo
  });
  it('debería rechazar la promesa si el archivo no es Markdown', () => {
    const result = mdLinks('index.js'); 
    return expect(result).rejects.toMatch('La ruta no es ni un archivo ni un directorio válido'); //reject que se rechace toMatch se utiliza para el motivo de rechazo
  });
  it('debería crear una instancia de marked.Renderer y capturar enlaces', () => {
    const filePath='example/Markdown.md'; 
   
    return mdLinks(filePath).then((result) => {

    // se asegura de que el resultado sea un arreglo de enlaces
    expect(Array.isArray(result)).toBe(true);  // funcion array.isArray devuelve true si es array 

    // se asegura de que se haya capturado al menos un enlace
    expect(result.length).toBeGreaterThan(0); // longitud del array que por lo menos 1 elemento
 
     // se asegura de que cada enlace tenga las propiedades href, text y file
    result.forEach((link) => {
      expect(link).toHaveProperty('href');
      expect(link).toHaveProperty('text');
      expect(link).toHaveProperty('file', 'C:\\LABORATORIA\\prueba\\DEV010-md-links\\example\\Markdown.md');
    });
  });
});

it('cuando no hay archivos Markdrown', () => {
  const filePath='example/Markdown.md'; 
  const markdownContent = ''; // Contenido vacío,
 
  return  processMarkdownContent(markdownContent, filePath)
  .catch((error)=> {
    // se asegura que haya capturado al menos un enlace
    expect(error).toBe('No hay enlaces en el archivo Markdown.');

  });
});
});



describe('validateLinks', () => {
  it('debería validar enlaces correctamente', () => {
    const links = [
      { href: 'https://www.laboratoria.la' },
      { href: 'https://www.google.com' },
    ];

    fetch.mockResolvedValue({ status: 200, ok: true });

    return validateLinks(links).then((result) => {
      expect(result.links).toHaveLength(2);
      expect(result.summary.ok).toBe(2);
      expect(result.summary.fail).toBe(0);
    });
  });

  it('debería manejar enlaces rotos correctamente', () => {
    const links = [
      { href: 'https://www.laboratoria.la' },
      { href: 'https://www.google.com' },
    ];

    fetch.mockResolvedValueOnce({ status: 200, ok: true });
    fetch.mockResolvedValueOnce({ status: 404, ok: false });

    return validateLinks(links).then((result) => {
      expect(result.links).toHaveLength(2);
      expect(result.summary.ok).toBe(1);
      expect(result.summary.fail).toBe(1);
    });
  });
  it('cuando no tiene respuesta del servidor', (done) => { //done para verificar que la prueba ha finalizado 
    const links = [
      { href: 'https://www.google.com' }, // Este enlace no existe
    ];
  
    // Simula un error en la solicitud
    fetch.mockRejectedValueOnce(new Error('Error en la solicitud'));
  
    validateLinks(links).then(result => {
      // Verifica que al menos un enlace tenga estado 'fail'
      expect(result.links.some(link => link.ok === 'fail')).toBe(true);
      done(); // Llama a done() para indicar que la prueba ha finalizado
    })
  });
});

const { readDirectory } = require('../lib/app.js');



// test para testear readDirectory

describe('readDirectory', () => {
  it('debería devolver enlaces de archivos Markdown en un directorio', (done) => {
    const directoryPath = 'example';
    const validate = false;

    readDirectory(directoryPath, validate)
      .then((result) => {
        // Verificar que result sea un objeto con una propiedad 'links'
        expect(result).toHaveProperty('links');

        // Verificar que result.links sea un arreglo
        expect(Array.isArray(result.links)).toBe(true);

        // Verificar que los enlaces coinciden con los esperados (ajusta los valores según tus expectativas)
        expect(result.links).toEqual([
          // Enlaces esperados
          { href: 'https://www.google.com', text: 'Enlace a Google', file: 'example\\Markdown.md' },
          { href: 'https://www.laboratoria.la/', text: 'Enlace a Laboratiria', file: 'example\\Markdown.md' },
          { href: 'https://github1.com/', text: 'Enlace a roto  github', file: 'example\\Markdown.md' },
        ]);

        done(); // Indicar que la prueba ha terminado
      })
      .catch((error) => {
        done(error); // Notificar un error si ocurre
      });
  });
});

describe('readDirectory', () => {
  it('debería devolver enlaces de archivos Markdown en un directorio', (done) => {
    const directoryPath = 'example';
    const validate = true;

    readDirectory(directoryPath, validate)
      .then((result) => {
        // Verificar que result sea un objeto con una propiedad 'links'
        expect(result).toHaveProperty('links');

        // Verificar que result.links sea un arreglo
        expect(Array.isArray(result.links)).toBe(true);

        // Verificar que los enlaces coinciden con los esperados (ajusta los valores según tus expectativas)
        expect(result.links).toEqual([
          // Enlaces esperados.
          { href: 'https://www.google.com', text: 'Enlace a Google', file: 'example\\Markdown.md', ok: 'ok', status: 200, },
          { href: 'https://www.laboratoria.la/', text: 'Enlace a Laboratiria', file: 'example\\Markdown.md', ok: 'ok', status: 200, },
          { href: 'https://github1.com/', text: 'Enlace a roto  github', file: 'example\\Markdown.md', ok: 'ok', status: 200, },
        ]);

        done(); // a prueba ha terminado
      })
      .catch((error) => {
        done(error); // Notificar un error si ocurre
      });
  });
});
  
