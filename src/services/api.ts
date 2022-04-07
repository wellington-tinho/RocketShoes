import axios from 'axios';

var API
if (process.env.NODE_ENV !== 'production') {
  baseURL = 'http://localhost:3333/'
  
} else {
  baseURL = ('https://rocketshoes.luizbatanero.vercel.app/')
  
}

export const api = axios.create({
  baseURL: API,
})

api.get('/')
.then(response => console.info(response.data))
.catch((err) => console.warn('Não foi possivel se conectar com a API, \n\n',err)
)
