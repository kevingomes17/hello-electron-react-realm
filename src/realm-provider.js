import Realm from "realm";
import { useEffect } from "react";

const realmAppID = process.env.REACT_APP_REALM_APP_ID;
const realmApiKey = process.env.REACT_APP_REALM_API_KEY;

const app = new Realm.App({ id: realmAppID }); // create a new instance of the Realm.App

async function realmLogin() {
  if (realmApiKey) {
    const credentials = Realm.Credentials.serverApiKey(realmApiKey);
    try {
      const user = await app.logIn(credentials);
      console.log("Successfully logged in!", user.id);
      return user;
    } catch (err) {
      console.error("Failed to log in", err.message);
    }
  } else {
    // login with an anonymous credential
    await app.logIn(Realm.Credentials.anonymous());
  }
}

async function fetchProducts() {
  const product_sodiumDisclaimerSchema = {
    name: 'product_sodiumDisclaimer',
    embedded: true,
    properties: {
      boolean: 'bool?',
    },
  };

  const product_productNameSchema = {
    name: 'product_productName',
    embedded: true,
    properties: {
      locale: 'string?',
      value: 'string?',
    },
  };

  const product_productIndicatorSellableSchema = {
    name: 'product_productIndicatorSellable',
    embedded: true,
    properties: {
      boolean: 'bool?',
    },
  };

  const product_productDescriptionSchema = {
    name: 'product_productDescription',
    embedded: true,
    properties: {
      locale: 'string?',
      value: 'string?',
    },
  };

  const product_optionSetV2_optionSetItemsSchema = {
    name: 'product_optionSetV2_optionSetItems',
    embedded: true,
    properties: {
      OptionSetTitle: 'string?',
      optionSetId: 'string?',
    },
  };

  const product_optionSetV2Schema = {
    name: 'product_optionSetV2',
    embedded: true,
    properties: {
      maxComponentOrderIncrement: 'int?',
      maxOptimalComponentIncrement: 'int?',
      maximumSelections: 'int?',
      menuDisplaySequence: 'int?',
      minOptimalComponentIncrement: 'int?',
      minimumSelections: 'int?',
      optionSetDescription: 'string?',
      optionSetItems: 'product_optionSetV2_optionSetItems[]',
      optionSetKey: 'string?',
      optionSetName: 'string?',
    },
  };

  const productSchema = {
    name: 'product',
    properties: {
      _id: 'string?',
      _partition: 'string?',
      optionSetV2: 'product_optionSetV2[]',
      productDescription: 'product_productDescription',
      productId: 'string?',
      productIndicatorSellable: 'product_productIndicatorSellable',
      productName: 'product_productName',
      productTypeName: 'string?',
      sodiumDisclaimer: 'product_sodiumDisclaimer',
    },
    primaryKey: '_id',
  };

  console.log('current user: ', app.currentUser);

  const realmInstance = await Realm.open({
    schema: [
      product_sodiumDisclaimerSchema,
      product_productNameSchema,
      product_productIndicatorSellableSchema,
      product_productDescriptionSchema,
      product_optionSetV2_optionSetItemsSchema,
      product_optionSetV2Schema,
      productSchema
    ],
    sync: {
      user: app.currentUser,
      partitionValue: "myPartition"
    }
  });

  console.log('Initialized Realm!');

  const products = realmInstance.objects('product');
  return products;
}

async function run() {
  await realmLogin();

  const products = await fetchProducts();
  const transformedProducts = products.map((rec) => {
    const data = {
      _id: rec._id,
      productId: rec.productId,
      productName: rec.productName,
      productTypeName: rec.productTypeName,
      productDescription: rec.productDescription,
      productIndicatorSellable: rec.productIndicatorSellable,
      sodiumDisclaimer: rec.sodiumDisclaimer,
      optionSetV2: []
    };

    if (rec.optionSetV2) {
      const transformedOptionSets = rec.optionSetV2.map((optionSetRec) => {
        const data_optionSet = {
          maxComponentOrderIncrement: optionSetRec.maxComponentOrderIncrement,
          maxOptimalComponentIncrement: optionSetRec.maxOptimalComponentIncrement,
          maximumSelections: optionSetRec.maximumSelections,
          menuDisplaySequence: optionSetRec.menuDisplaySequence,
          minOptimalComponentIncrement: optionSetRec.minOptimalComponentIncrement,
          minimumSelections: optionSetRec.minimumSelections,
          optionSetDescription: optionSetRec.optionSetDescription,
          optionSetItems: [],
          optionSetKey: optionSetRec.optionSetKey,
          optionSetName: optionSetRec.optionSetName,
        }

        if (optionSetRec.optionSetItems) {
          const transformedOptionSetItems = optionSetRec.optionSetItems.map((optionSetItemRec) => {
            const data_optionSetItem = {
              optionSetId: optionSetItemRec.optionSetId,
              OptionSetTitle: optionSetItemRec.OptionSetTitle
            };
            return data_optionSetItem;
          });
          data_optionSet.optionSetItems = transformedOptionSetItems;
        }
        return data_optionSet;
      });
      data.optionSetV2 = transformedOptionSets;
    }
    return data;
  });
  return transformedProducts;
}

function RealmProvider({ children }) {
  useEffect(() => {
    run().then((products) => {
      console.log('useEffect: ', products.length, products);
    }).catch(err => {
      console.error("Failed to open realm:", err)
    });
  }, []);

  return (
    <>{children}</>
  )
}

export default RealmProvider;