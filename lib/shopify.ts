import { GraphQLClient, gql } from 'graphql-request';

function shopifyClient(){
  const endpoint = `https://${process.env.SHOPIFY_SHOP}/admin/api/2024-10/graphql.json`;
  return new GraphQLClient(endpoint, { headers: { 'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN! } });
}

export async function findOrderByNumber(orderNumber: string){
  const name = `#${orderNumber.replace(/^#/, '')}`;
  const query = gql`
    query($q: String!) {
      orders(first: 1, query: $q) {
        edges { node {
          id name customer { id displayName email phone }
          shippingAddress { phone }
          lineItems(first: 50) { edges { node { id title sku quantity variant { title } } } }
        } }
      }
    }
  `;
  const client = shopifyClient();
  const res:any = await client.request(query, { q: `name:${JSON.stringify(name)}` });
  const edge = res?.orders?.edges?.[0];
  return edge?.node || null;
}
