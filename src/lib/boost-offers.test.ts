import { describe, expect, it } from "vitest";
import type { Product } from "@shoppexio/storefront";
import { getBoostOffers } from "./boost-offers";

// Synthetic fixtures are only for tests and are never displayed in the storefront.
const fixture = (overrides: Partial<Product> = {}): Product => ({ uniqid:"test-only",title:"14 Server Boosts",price:"17.50",currency:"USD",stock:5,images:[],...overrides });
describe("Shoppex configurator mapping",()=>{
  it("maps explicit counts and duration from a product title",()=>{
    expect(getBoostOffers([fixture({title:"14 Server Boosts / 3 months"})])[0]).toMatchObject({count:14,duration:3,price:17.5});
  });
  it("preserves the actual variant ID and price for duration variants",()=>{
    const offers=getBoostOffers([fixture({variants:[{id:"month",title:"1 month",price:11,stock:3},{id:"year",title:"1 year",price:71,stock:0}]})]);
    expect(offers.map(o=>[o.variantId,o.duration,o.price])).toEqual([["month",1,11],["year",12,71]]);
    expect(offers[1].product.variants?.[1].stock).toBe(0);
  });
  it("supports boost counts held in options",()=>{
    expect(getBoostOffers([fixture({title:"Server Boost Packages",variants:[{id:"twenty",title:"20 boosts - 3 months",price:25}]})])[0]).toMatchObject({count:20,duration:3,variantId:"twenty",price:25});
  });
  it("rejects conflicting labels and unrelated products",()=>{
    expect(getBoostOffers([fixture({title:"14 boosts / 1 month",variants:[{id:"conflict",title:"3 months",price:20}]}),fixture({title:"Access pass $14"})])).toEqual([]);
  });
  it("rejects missing, malformed and negative prices instead of inventing zero",()=>{
    expect(getBoostOffers([fixture({price:undefined}),fixture({price:"unknown"}),fixture({price:"-1"}),fixture({price:""})])).toEqual([]);
    expect(getBoostOffers([fixture({price_variants:[{id:"bad",title:"1 month",price:"unknown"} as never]})])).toEqual([]);
  });
  it("keeps an explicitly published zero price and unknown duration",()=>{
    expect(getBoostOffers([fixture({price:"0"})])[0]).toMatchObject({price:0,duration:null});
  });
});
