export const SHADER_IDS = [
  "WcKXDV", "NslGRN", "Ms2SD1", "tdG3Rd", "tfK3Dy", "XlBSRz", "ltj3zR", "XsjXRm", "Xtf3zn",
  "33tGzN", "WsSBzh", "3lsSzf", "4ttSWf", "XfyXRV", "3sySRK", "MdXSWn", "ssjyWc", "XslGRr",
  "MdX3Rr", "ld3Gz2", "MdXyzX", "3l23Rh", "4dfGzs", "ftt3R7", "ltffzl", "4tjGRh", "MsXGWr",
  "Msl3Rr", "XlfGRj", "ldScDh", "ldlcRf", "XtdGR7", "MdBGzG", "llj3Rz", "MdfBRX", "4sS3zG",
  "llK3Dy", "4dXGR4", "Xl2XRW", "4dcGW2", "4ldGz4", "lsySzd", "ldd3DX", "XtGGRt", "lstSRS",
  "XsfGWN", "lsXGzH", "4dSBDt", "XXjSRc", "MslGWN", "ldSSzV", "Mld3Rn", "Mss3zM", "XsyGWV",
  "lt3XDM", "ldj3Dm", "WdVfRc", "XtcyW4", "tsKXR3", "4dKGWm", "lsf3zr", "7tjSDh", "XltGRX",
  "cs2GWD", "lllBDM", "tt2XzG", "Xtt3Wn", "lsX3WH", "XsfGzH", "WlVyRV", "lds3zr", "4dlyWX",
  "lty3Rt", "4slSWf", "4dtGWM", "tsVcWt", "lsVXRh", "fstyD4", "XXyGzh", "Ndc3zl", "XdsGDB",
];

export function getRandomShaderId() {
  const randomIndex = Math.floor(Math.random() * SHADER_IDS.length);
  return SHADER_IDS[randomIndex];
}