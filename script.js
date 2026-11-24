function generatePassword() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  const array = new Uint32Array(20);
  crypto.getRandomValues(array);

  let password = "";
  for (let i = 0; i < 20; i++) {
    password += chars[array[i] % chars.length];
  }

  document.getElementById("password").textContent = password;
}

function analyzePassword() {
  const value = document.getElementById("checkPassword").value;
  let score = 0;

  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[a-z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  document.getElementById("result").textContent =
    "Niveau estimé : " + ["Très faible", "Faible", "Moyen", "Bon", "Fort", "Très fort"][score];
}
