const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/credentials.json').apiKey
const sentenceBoudaryDetection = require('sbd')

async function robot(content){
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)

    async function fetchContentFromWikipedia(content) {
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
        const wikipediaResponde = await wikipediaAlgorithm.pipe(content.searchTerm)
        const wikipediaContent = wikipediaResponde.get()

        content.sourceContentOriginal = wikipediaContent.content
    }
    function sanitizeContent() {
        const withoutBlankLinesandMarkdown = removeBlankLinesandMarkdown(content.sourceContentOriginal)
        const withoutDatesinParentheses = removeDatesInParentheses(withoutBlankLinesandMarkdown)

        content.sourceContentSanitized = withoutDatesinParentheses

        function removeBlankLinesandMarkdown(text) {
            const allLines = text.split('\n')

            const withoutBlankLinesandMarkdown = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')){
                    return false
                }
                
                return true
            })

            return withoutBlankLinesandMarkdown.join(' ')
        }
        function removeDatesInParentheses(text) {
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
        }
    }
    function breakContentIntoSentences(content){
        content.sentences = []

        const sentences = sentenceBoudaryDetection.sentences(content.sourceContentSanitized)
        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }
}
module.exports = robot