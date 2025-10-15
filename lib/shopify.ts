
import { GraphQLClient, gql } from 'graphql-request';
const SHOP = process.env.SHOPIFY_SHOP!;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN!;
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2023-10';
function client(){ if(!SHOP||!TOKEN) throw new Error('Missing SHOPIFY envs'); const endpoint=`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`; return new GraphQLClient(endpoint,{headers:{'X-Shopify-Access-Token':TOKEN}}); }
export async function findOrderByNumber(orderNumber:string){
  const q=gql`query($query:String!){orders(first:1,query:$query){edges{node{id name createdAt fulfillmentStatus customer{phone} shippingAddress{phone} lineItems(first:100){edges{node{id title quantity sku variant{title}}}}}}}}`;
  const res:any=await client().request(q,{query:`name:#${orderNumber}`}); const edge=res?.orders?.edges?.[0]; return edge?.node||null;
}
