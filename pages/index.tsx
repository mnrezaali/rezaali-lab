import Head from 'next/head';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Head>
        <title>Rezaali Lab</title>
        <meta name="description" content="Welcome to Rezaali Lab - A collection of interactive workshop apps" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="text-center p-8">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to Rezaali Lab
        </h1>
        <p className="text-2xl text-gray-600">
          Hello World! This is the beginning of something amazing.
        </p>
      </main>
    </div>
  );
}
