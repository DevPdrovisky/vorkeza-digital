// Busca dados do Web Analytics (pessoas reais) em blocos de 7 dias.
// Com períodos longos a Cloudflare responde com amostras arredondadas e sem o dia de hoje;
// em blocos curtos os números vêm exatos.
// dims: { nome: 'dimensao' }  ex.: { paginas: 'requestPath' }  (o dia a dia vem sempre em .dias)
async function rumPorBlocos(cf, conta, dias, dims = {}, diasDims = dias) {
  const porDia = {}, grupos = Object.fromEntries(Object.keys(dims).map(k => [k, {}]));
  for (let i = 0; i < dias.length; i += 7) {
    const bloco = dias.slice(i, i + 7), de = bloco[0], ate = bloco[bloco.length - 1];
    const comDims = bloco.some(d => diasDims.includes(d));
    const ini = comDims ? (diasDims.includes(de) ? de : diasDims[0]) : null;
    const extras = comDims ? Object.entries(dims).map(([k, d]) =>
      `${k}: rumPageloadEventsAdaptiveGroups(limit:200,filter:{date_geq:"${ini}",date_leq:"${ate}"},orderBy:[count_DESC]){count sum{visits} dimensions{${d}}}`).join('\n') : '';
    const q = `query($a:String!){viewer{accounts(filter:{accountTag:$a}){
      dias: rumPageloadEventsAdaptiveGroups(limit:50,filter:{date_geq:"${de}",date_leq:"${ate}"},orderBy:[date_ASC]){count sum{visits} dimensions{date}}
      ${extras}}}}`;
    const r = await cf('/graphql', { query: q, variables: { a: conta } });
    const acc = r.data.viewer.accounts[0]; if (!acc) continue;
    for (const x of acc.dias) porDia[x.dimensions.date] = { visits: x.sum.visits, views: x.count };
    for (const [k, d] of Object.entries(dims)) for (const x of acc[k] || []) {
      const chave = x.dimensions[d] ?? '';
      const g = grupos[k][chave] || (grupos[k][chave] = { k: chave, visits: 0, views: 0 });
      g.visits += x.sum.visits; g.views += x.count;
    }
  }
  const out = { dias: dias.map(date => ({ date, visits: porDia[date]?.visits || 0, views: porDia[date]?.views || 0 })) };
  for (const k of Object.keys(dims)) out[k] = Object.values(grupos[k]).sort((a, b) => b.visits - a.visits || b.views - a.views);
  return out;
}
module.exports = { rumPorBlocos };
