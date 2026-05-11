import fetch from "node-fetch";
async function test() {
  try {
    const res = await fetch("http://localhost:3000/api/forex?timeframe=15M");
    const json = await res.json();
    console.log(json);
  } catch(e) {
    console.error(e);
  }
}
test();
