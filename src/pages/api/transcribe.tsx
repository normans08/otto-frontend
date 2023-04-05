export default async function handler(req: any, res: any) {
  // Get data submitted in request's body.
  const mySecret = "98fa4787dbdaaccedafff617490ad5470b893e32";
  const { url } = JSON.parse(req.body);

  const response = await fetch(
    "https://api.deepgram.com/v1/listen?tier=enhanced&punctuate=true&paragraphs=true&diarize=true&keywords=Bekah:2&keywords=Hacktoberfest:2",
    {
      method: "POST",
      headers: {
        Authorization: `Token ${mySecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
      }),
    }
  );
  console.log("response", response);
  const json = await response.json();
  res.status(200).json(JSON.stringify(json));
}
