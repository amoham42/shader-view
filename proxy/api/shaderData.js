export const SHADER_IDS = [
  "WcKXDV", "MsXfz4", "NslGRN", "Ms2SD1", "tdG3Rd", 
  "33tGzN", "WsSBzh", "3lsSzf", "4ttSWf", "XfyXRV"
];

export function getRandomShaderId() {
  const randomIndex = Math.floor(Math.random() * SHADER_IDS.length);
  return SHADER_IDS[randomIndex];
}