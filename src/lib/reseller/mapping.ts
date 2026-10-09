// Which Liteboosts wholesale product each GGBoosts product buys. IDs come from the reseller catalog
// (/api/admin/reseller-catalog). Products not listed here (e.g. Nitro 1 Month / 1 Year) stay manual.

type Target = { productId: string; variantId: string };

const BOOSTS: Record<string, Target> = {
  "8|1 Month": { productId: "019fedfe-5c6b-79d6-a509-37bb0c62bd69", variantId: "019fedfe-5c71-7626-92e9-50246e5722ad" },
  "8|3 Months": { productId: "019fedfe-67ec-7e2f-b076-446277071145", variantId: "019fedfe-67f2-745e-aef4-6dff2cff2cc1" },
  "8|1 Year": { productId: "019fedfe-736b-7aa9-a604-823910430f3b", variantId: "019fedfe-7376-7597-8dcc-4883ad7e44ef" },
  "14|1 Month": { productId: "019fedfe-5f2e-7239-a3b4-51110ebb72ec", variantId: "019fedfe-5f35-7e22-806e-a088e6187e3c" },
  "14|3 Months": { productId: "019fedfe-6ac4-7852-ad10-dcedb16845cd", variantId: "019fedfe-6ac8-7b81-8299-61965f69fc50" },
  "14|1 Year": { productId: "019fedfe-7661-7ca6-97e2-e6fbd95dde86", variantId: "019fedfe-7679-7e83-a82e-a6fdd4042fed" },
  "14|Lifetime": { productId: "019fedfe-b987-7b21-b56c-468986237365", variantId: "019fedfe-b98d-71c1-847c-93d559e295a0" },
  "20|1 Month": { productId: "019fedfe-6208-7be4-909c-2a2c3baf99a2", variantId: "019fedfe-6212-7d5c-8032-191b2241815d" },
  "20|3 Months": { productId: "019fedfe-6da9-7fe4-8df7-9f8482041674", variantId: "019fedfe-6db8-77dc-bad5-821728f5959b" },
  "20|1 Year": { productId: "019fedfe-7937-7488-99aa-91b6d5503760", variantId: "019fedfe-793e-7e30-9d07-17f517854289" },
  "20|Lifetime": { productId: "019fedfe-bc55-75d7-9811-7ae03eff624d", variantId: "019fedfe-bc59-7431-be78-3bddb4580512" },
  "30|1 Month": { productId: "019fedfe-64ed-79e4-ade6-2d49a53a6fa3", variantId: "019fedfe-64fb-7a3b-af71-c663e03f7b4e" },
  "30|3 Months": { productId: "019fedfe-7088-76a0-a07a-af8045e07b9c", variantId: "019fedfe-708c-77b6-8429-26846dc50db5" },
  "30|1 Year": { productId: "019fedfe-7c2b-74ee-b144-ca05e6546715", variantId: "019fedfe-7c33-7ffc-9404-e35159226d10" },
  "30|Lifetime": { productId: "019fedfe-bf42-7004-beca-e05942b1cffa", variantId: "019fedfe-bf5d-7de5-bbdf-c0e5c96e2a75" },
};

// Matched on a lower-cased, punctuation-free version of the GGBoosts product title.
const BY_TITLE: [RegExp, Target][] = [
  [/^2016 account/, { productId: "019fedfe-d882-7c92-972d-2c010bc53d3f", variantId: "019fedfe-d886-7e2c-9933-14406057dec2" }],
  [/^2017 account/, { productId: "019fedfe-d5a4-7091-9eed-01825d498faa", variantId: "019fedfe-d5b2-79a7-9f21-9de5c333d255" }],
  [/^2018 account/, { productId: "019fedfe-d2de-763f-9e3c-f08c76260530", variantId: "019fedfe-d2ef-7ca6-b71b-7abec0b0e78c" }],
  [/^2019 account/, { productId: "019fedfe-d014-76a4-8726-26f56d322093", variantId: "019fedfe-d01d-7024-ba61-7811e78aaa54" }],
  [/^2020 account/, { productId: "019fedfe-cd4b-7034-a12a-2309db8e8e9a", variantId: "019fedfe-cd51-73c2-965e-023d9891aeb3" }],
  [/^2021 account/, { productId: "019fedfe-ca7c-7855-b8d1-44713e058ea3", variantId: "019fedfe-ca88-79e9-9cea-2c7721ce3880" }],
  [/^3 month nitro account/, { productId: "019fedfe-e370-715c-80da-8a5b48ef606d", variantId: "019fedfe-e374-720a-9c1d-af5bffe1d319" }],
  [/^discord nitro 3 months?$/, { productId: "019fedfe-a4fd-7d2b-83ce-1362de0e3a7a", variantId: "019fedfe-a515-763d-b8c0-268b071c11c0" }],
  [/^nitro account token 1 month$/, { productId: "019fedfe-b056-71fc-86c3-bd19d7dd4b56", variantId: "019fedfe-b05c-7ec3-b112-bceb52499fb7" }],
  [/^nitro account token 3 months$/, { productId: "019fedfe-b38e-7729-a231-e07681a4ce83", variantId: "019fedfe-b395-73b2-8141-0f9ffcc2cc47" }],
  [/^nft online members$/, { productId: "019fedfe-8809-7bca-ae3d-e496ce246356", variantId: "019fedfe-880f-701f-a111-8f98600a20cf" }],
  [/^online members$/, { productId: "019fedfe-824c-7f80-b48b-e52b0056b84a", variantId: "019fedfe-8251-78eb-ad8f-357066d1d1e4" }],
  [/^offline members$/, { productId: "019fedfe-8520-73cb-acf1-90fbb7177e53", variantId: "019fedfe-8523-7538-a2e2-58f3d11c9aff" }],
  [/^message reactions$/, { productId: "019fedfe-8dca-7d6e-94c8-f334e71447f3", variantId: "019fedfe-8dcf-7d1a-b58c-b9f9445417de" }],
];

const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

function duration(variantTitle: string): string | null {
  const t = clean(variantTitle);
  if (/lifetime/.test(t)) return "Lifetime";
  if (/\b(1 year|12 months?|yearly|annual)\b/.test(t)) return "1 Year";
  if (/\b3 months?\b/.test(t)) return "3 Months";
  if (/\b1 month\b|monthly/.test(t)) return "1 Month";
  return null;
}

/** Find the Liteboosts product for a GGBoosts order line, or null if it must be fulfilled by hand. */
export function resellerTarget(productTitle: string, variantTitle: string | null | undefined): Target | null {
  const t = clean(productTitle);
  const boosts = t.match(/^(\d+) (server )?boosts?$/);
  if (boosts) {
    const d = duration(variantTitle ?? "");
    return d ? BOOSTS[`${boosts[1]}|${d}`] ?? null : null;
  }
  return BY_TITLE.find(([re]) => re.test(t))?.[1] ?? null;
}
