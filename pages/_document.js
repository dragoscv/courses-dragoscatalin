import Document, { Html, Head, Main, NextScript } from 'next/document'
class MyDocument extends Document {

    render() {
        return (
            <Html
                className="scroll-smooth dark"
            // style={{ scrollBehavior: 'smooth' }}
            >
                <Head>
                    <link rel="icon" href="/assets/logo/logo-daam-white.svg" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default MyDocument