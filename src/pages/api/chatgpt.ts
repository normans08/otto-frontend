import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
    apiKey: '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',
});
export default async function handler(req: any, res: any) {

    const openai = new OpenAIApi(configuration);

    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: "Say this is a test",
            max_tokens: 7,
            temperature: 0,
        });
        res.status(200).json(response)
    } catch (err) {
        res.status(500).json(err)

    }
}