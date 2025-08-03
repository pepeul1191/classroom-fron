import axios from 'axios';

// === Función principal ===
export const login = async (username, password) => {
  const answer = { user: {}, tokens: [], status: 200 };

  try {
    // Paso 1: Autenticación en el servicio de acceso
    const accessData = await authenticateWithAccessService(username, password);
    
    //console.log(JSON.stringify(accessData))

    answer.user.id = accessData.id;    
    answer.user.username = accessData.username;
    answer.user.email = accessData.email;
    answer.user.roles = accessData.roles; // Asumimos que hay al menos un rol
    answer.tokens = { access: accessData.token };
    
    // Paso 2: Generar token para el servicio de archivos
    const filesToken = await generateFilesToken(answer.user);
    if (!filesToken.success) {
      throw new Error(filesToken.message);
    }
    answer.tokens.files = filesToken.token;

    //console.log(JSON.stringify(answer))    

    // Paso 3: Generar token para el servicio de classroom
    const classroomData = await generateClassroomToken(answer.user, answer.user.roles);
    if (!classroomData.success) {
      throw new Error(classroomData.message);
    }

    // Combinar resultados exitosos
    answer.tokens.classroom = classroomData.token;
    answer.person = classroomData.person;

  } catch (error) {
    handleLoginError(answer, error);
  }

  return answer;
};

// === Función 1: Autenticación con el servicio de acceso ===
/**
 * @typedef {Object} AccessServiceResponse
 * @property {number} id
 * @property {string} username
 * @property {string} email
 * @property {number} system_id
 * @property {string} token
 * @property {Array<{role: string, permissions: string[]}>} roles
 */
const authenticateWithAccessService = async (username, password) => {
  const response = await axios.post(
    `${process.env.URL_ACCESS_SERVICE}api/v1/auth/by-username`,
    {
      username,
      password,
      system_id: parseInt(process.env.SYSTEM_ID)
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Auth-Trigger': process.env.X_AUTH_ACCESS_SERVICE
      }
    }
  );

  if (response.status !== 200) {
    throw new Error(response.data.message || 'Error en autenticación de acceso');
  }

  return response.data;
};

// === Función 2: Generar token para el servicio de archivos ===
const generateFilesToken = async (userData) => {
  try {
    const response = await axios.post(
      `${process.env.URL_FILES_SERVICE}api/v1/auth/generate-token`,
      {
        user: {
          id: String(userData.id),
          username: userData.username,
          email: userData.email
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Auth-Trigger': process.env.X_AUTH_FILES_SERVICE
        }
      }
    );

    if (response.status === 200) {
      return { success: true, token: response.data.token };
    } else {
      return {
        success: false,
        message: response.data.message || 'Error en servicio de archivos'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message
    };
  }
};

// === Función 3: Generar token para el servicio de classroom ===
const generateClassroomToken = async (userData, roles) => {
  console.log(roles)
  try {
    const response = await axios.post(
      `${process.env.URL_CLASSROOM_SERVICE}api/v1/auth/generate-token`,
      {
        user: {
          id: String(userData.id),
          username: userData.username,
          email: userData.email
        },
        roles
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Auth-Trigger': process.env.X_AUTH_CLASSROOM_SERVICE
        }
      }
    );

    if (response.status === 200) {
      return {
        success: true,
        token: response.data.token,
        person: response.data.person
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Error en servicio classroom'
      };
    }
  } catch (error) {
    console.log(error)
    return {
      success: false,
      message: error.response?.data?.message || error.message
    };
  }
};

// === Función 4: Manejo de errores ===
const handleLoginError = (answer, error) => {
  console.error(answer)
  if (error.response) {
    // Error proveniente de una respuesta HTTP
    answer.body.error = error.response.data.message || error.message;
    answer.body.message = 'Error al contactar con la API externa';
    answer.status = error.response.status;
  } else {
    // Error general (red, timeout, etc.)
    console.error('Error en login:', error.message);
    answer.body.error = 'Ocurrió un error al generar los JWTs';
    answer.body.message = error.message;
    answer.status = 500;
  }
};