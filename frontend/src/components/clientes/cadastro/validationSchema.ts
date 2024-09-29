import * as Yup from "yup";

const msgCampoObrigatorio = "Campo Obrigatório";

const campoObrigatórioValidation = Yup.string()
  .trim()
  .required(msgCampoObrigatorio);

const emailValidation = Yup.string()
  .trim()
  .email("E-mail inválido")
  .notRequired();

export const validationScheme = Yup.object().shape({
  nome: campoObrigatórioValidation,
  email: emailValidation,
});