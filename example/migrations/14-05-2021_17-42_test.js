export async function up(transaction) {
  // This is the current transactional client, if you use this to patch/... it won't be part
  // of the transaction. So only use this one to "GET" data.
  const client = transaction.client;
  // This gets some document
  const document = await client.getDocument('movie_10681');
  console.log('Found', document.title);
  // We use the transaction to patch some property, for instance we've moved to a localised string and need
  // to move the existing title to the "en" property.
  transaction
    .patch(document._id, {
      set: { 'title': 'WALL·E but cooler'}
    })

  return transaction;
}
