import { serve } from "@hono/node-server";
import { Hono } from "hono";
import axios from "axios";
import { cors } from "hono/cors";

const app = new Hono();
app.use(
  "/api/*",
  cors({
    origin: "http://localhost:5173", // Origen exacto de tu frontend
    credentials: true, // Permite cookies y credenciales
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length", "Set-Cookie"],
  })
);

app.get("/api/proxy-login", (c) => {
  return c.text("Hello Hono!");
});

app.post("/api/proxy-login", async (c) => {
  const { username, password } = await c.req.json();

  const response = await axios
    .post(
      "https://siipi.izt.uam.mx/login_check",
      new URLSearchParams({
        _username: username,
        _password: password,
        _remember_me: "on",
      }),
      {
        maxRedirects: 0,
        validateStatus: (status) => status === 302,
      }
    )
    .catch((error) => {
      if (error.response) {
        return error.response;
      }
      throw error;
    });

  console.log(response);

  return c.json({
    success: true,
    cookies: response.headers["set-cookie"],
    location: response.headers.location,
  });
});

app.get("/api/proxy-alumno", async (c) => {
  const cookies = await c.req.header("Cookie");
  const response = await axios
    .get("https://siipi.izt.uam.mx/alumno", {
      headers: {
        cookie: cookies,
      },
    })
    .catch((error) => {
      if (error.response) {
        return error.response;
      }
      throw error;
    });

  const cleanedData = response.data
    .split("INFORMACIÓN DEL ALUMNO PARA EL TRIMESTRE ")[1]
    .split('<table class="table-striped table">')[0]
    .replace(/<\/?[^>]+(>|$)/g, "");

  const trimester = cleanedData.split("ALUMNO")[0].trim();
  const name = cleanedData.split("ALUMNO:")[1].split("ESTADO")[0].trim();
  const status = cleanedData
    .split("ESTADO:")[1]
    .split("TRIMESTRE INGRESO")[0]
    .trim();
  const firstTrimester = cleanedData
    .split("TRIMESTRE INGRESO:")[1]
    .split("MATRÍCULA")[0]
    .trim();
  const studentId = cleanedData
    .split("MATRÍCULA:")[1]
    .split("DEDICACIÓN")[0]
    .trim();
  const dedication = cleanedData
    .split("DEDICACIÓN:")[1]
    .split("ÚLTIMO TRIMESTRE")[0]
    .trim();
  const lastTrimester = cleanedData
    .split("ÚLTIMO TRIMESTRE INSCRITO:")[1]
    .split("DIVISIÓN")[0]
    .trim();
  const division = cleanedData
    .split("DIVISIÓN:")[1]
    .split("CRÉDITOS INSCRITOS")[0]
    .trim();
  const enrolledCredits = cleanedData
    .split("CRÉDITOS INSCRITOS:")[1]
    .split("CRÉDITOS CONTABILIZADOS")[0]
    .trim();
  const totalCredits = cleanedData
    .split("CRÉDITOS CONTABILIZADOS:")[1]
    .split("PLAN")[0]
    .trim();
  const plan = cleanedData
    .split("PLAN:")[1]
    .split("CLAVE DEL PLAN")[0]
    .split("\n")[0]
    .trim();
  const planKey = cleanedData
    .split("CLAVE DEL PLAN:")[1]
    .split("E-MAIL")[0]
    .split("\n")[0]
    .trim();
  const email = cleanedData.split("E-MAIL:")[1].trim();

  return c.json({
    success: true,
    data: {
      trimester,
      name,
      status,
      firstTrimester,
      studentId,
      dedication,
      lastTrimester,
      division,
      enrolledCredits,
      totalCredits,
      plan,
      planKey,
      email,
    },
  });
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
