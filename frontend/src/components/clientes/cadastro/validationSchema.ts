import * as Yup from "yup";

const msgCampoObrigatorio = "Campo Obrigatório";

const campoObrigatórioValidation = Yup.string()
  .trim()
  .required(msgCampoObrigatorio);

export const validationScheme = Yup.object().shape({
  nome: campoObrigatórioValidation,
});
