const mdLinks = require('./index');
const colors = require('colors');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestions = () => {
  rl.question('Ingrese la ruta a un archivo o directorio Markdown:  ', (path) => {
    path= path.toLowerCase();
    rl.question('¿Desea validar los enlaces? (Sí/No): ', (validateOption) => {
      const validate = validateOption.toLowerCase() === 'si';
      

      mdLinks(path, validate)
        .then((result) => {
          if (validate){
            console.log('Inpeccionando Rutas'.rainbow);
            console.table(result.links ? result.links : result);
            console.log('Enlaces "ok":'.bgYellow, result.summary.ok);
            console.log('Enlaces "fail":'.bgRed, result.summary.fail);
          } else {console.table(result.links ? result.links : result);}
           
        })
        .catch((error) => {
           console.error(`La ruta no es ni un archivo ni un directorio válido`, error .rainbow);
        })
        .finally(() => {
          rl.close();
        });
    });
  })
};

askQuestions();
