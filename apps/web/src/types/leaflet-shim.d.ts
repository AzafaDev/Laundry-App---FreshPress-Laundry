// Minimal declaration shim so `import L from "leaflet"` typechecks without the
// @types/leaflet package. Replace this with `npm i -D @types/leaflet` once you
// can install it locally to get full type support.
declare module "leaflet" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const L: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export default L;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type Marker = any;
}
