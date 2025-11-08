import PocketBase from "pocketbase";
const pb = new PocketBase("http://127.0.0.1:8090");

const data = {
  text: "Test",
};

pb.collection("reports")
  .create(data)
  .then((record) => {
    console.log("record created:", record);
  })
  .catch((err) => {
    console.error("Error:", err);
  });
