import Realm from "realm";
import { useEffect } from "react";

const app = new Realm.App({ id: "" }); // create a new instance of the Realm.App
async function run() {
  // login with an anonymous credential
  await app.logIn(Realm.Credentials.anonymous());

  const DogSchema = {
      name: "Dog",
      properties: {
        _id: 'int',
        name: "string",
        age: "int",
      },
      primaryKey: '_id'
  };

  const realm = await Realm.open({
    schema: [DogSchema],
    sync: {
      user: app.currentUser,
      partitionValue: "myPartition",
    },
  });

  console.log('Initialized Realm!');

  // The myPartition realm is now synced to the device. You can
  // access it through the `realm` object returned by `Realm.open()`

  // write to the realm
  // realm.write(() => {
  //   realm.create("Dog", {
  //     _id: 1,
  //     name: "German Sheperd",
  //     age: 7
  //   });
  // });
  const dogs = realm.objects('Dog');
  console.log('dogs: ', dogs.length);
  dogs.every((rec) => {
    console.log('entry: ', rec);
  });
}
run().catch(err => {
  console.error("Failed to open realm:", err)
});

function RealmProvider({ children }) {
  useEffect(() => {
    run();
  }, []);

  return (
    <>{children}</>
  )
}

export default RealmProvider;