export async function getStudentService(cookie: string) {
  const response = await fetch("https://siipi.izt.uam.mx/alumno/", {
    method: "GET",
    headers: {
      Cookie: `PHPSESSID=${cookie}`,
    },
  })
    .then((res) => res.text())
    .catch((error) => error.message);

  const firstFragment = response.split(
    '<div id="basica" class="collapse" style="vertical-align:middle;font-size:95%">'
  );
  firstFragment.shift();

  const secondFragment = firstFragment[0].split(
    '<table class="table-striped table">'
  );

  const mainFragment = secondFragment[0];

  const pattern = /<div class="col-md-\d+">\s*<b>[A-ZÁÉÍÓÚÜÑ\s]+:<\/b>/;
  const data = mainFragment.split(pattern);
  data.shift();

  const name = data[0].split("<")[0].trim();
  const state = data[1].split("<")[0].trim();
  const firstTrimester = data[2].split("<")[0].trim();
  const matricula = data[3].split("<")[0].trim();
  const dedication = data[4].split("<")[0].trim();
  const lastTrimester = data[5].split("<")[0].trim();
  const division = data[6].split("<")[0].trim();
  const enrolledCredits = Number(data[7].split("<")[0].trim());
  const totalCredits = Number(data[8].split("<")[0].trim());
  const plan = data[8].split(":")[1].split("<")[0].trim();
  const planKey = data[8].split(":")[2].split(">")[1].split("<")[0].trim();
  const email = data[8].split("E-MAIL:</b> <a>")[1].split("<")[0].trim();

  return {
    name,
    state,
    firstTrimester,
    matricula,
    dedication,
    lastTrimester,
    division,
    enrolledCredits,
    totalCredits,
    plan,
    planKey,
    email,
  };
}
