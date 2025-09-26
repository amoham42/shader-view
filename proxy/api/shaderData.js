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
  "wXG3W1", "wXK3Dh", "w3t3Wj", "33K3Dw", "DtdSz7", "w3sXzs", "4tByz3", "dsGBzW", "DlyyWR",
  "w3yGzw", "WXG3WD", "DldXDX", "W3SSRm", "XtGGRt", "ldfczS", "wfK3Rm", "mtlBzX", "M3ycWt",
  "wsByWV", "t3cGR2", "tXG3R1", "3cKSzc", "Wfy3zh", "tX3GD2", "WcGGDd", "ss3SD8", "4tGfDW",
  "fsXXzX", "fljBWc", "ssBGRG", "WXtGWr", "3XfXRN", "wtfBDf", "csl3DS", "csB3zy", "tt3yRH",
  "3ftGRl", "wfG3Dz", "w3dGW4", "wlycRR", "M3yBDW", "tXBGD3", "tcS3WD", "mlBSWc", "Xs2fWD",
  "l3Xyz4", "msG3zG", "lX2GDR", "wlVSDK", "WclSWl", "tdjyzz", "ldl3zN", "M3cyWH", "DdVSzR",
  "XsfGD4", "WftSDX", "wdfGW4", "XsjXR1", "mdt3D7", "WlKXzm", "tdjBR1", "4sXBRn", "WdB3Dw",
  "Mdl3Rr", "Wtc3W2", "ldd3DB", "4tl3RM", "3tXXRn", "ttcSD8", "lt2fD3", "ld3SDl", "3tX3R4",
  "WljSWz", "fdSGWw", "WtGXWm", "MsKBDG", "wdKBz1", "wtS3W3", "4dKXDG", "flfyRS", "7t3SW8",
  "dtsSDB", "sdBGWh", "sdBGWD", "stSXzm", "Xf2fDm", "Mt33Wn", "wlyfWK", "MsXyz8", "3sycDm",
  "mtyfRV", "X3cBDM", "llXGRX", "MsBGWm", "lstXW8", "X3l3Dr", "4ctBz4", "Xtcfzj", "wlyyWD",
  "3dsBD4", "4fKfWh", "lX2yDt", "tXdGzs", "csd3RX", "4tdcWn", "dlGyzD", "mtlyW2", "M32cRc",
  "tfjXWK", "XdlfWB", "4tSSDK", "4cVczm", "XX2yWy", "WcS3Rw", "Dlf3Df", "stSXzm", "l3XyRr",
  "XfKSzV", "llSSWW", "Ns2BWt", "7stSzf", "XXG3RG", "tftSDj", "cdV3Rc", "flc3Rn", "l3KcWh",
  "sltXRl", "MldyDH", "sl3yRM", "XlXGD7", "DtX3D7", "3d3fzS", "Mt3XWH", "cd2Xz1", "4dcfDX", 
  "tlXyzr", "NdBBzm", "ctV3WG",
];

export function getRandomShaderId() {
  const randomIndex = Math.floor(Math.random() * SHADER_IDS.length);
  return SHADER_IDS[randomIndex];
}