import { Button } from "@/components/ui/button";
import { ArrowRight, Cloud, Database, Speech } from "lucide-react";
import { TranscriptionDemo } from "./transcription-demo";

export default function HomePage() {
  return (
    <main>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                Supercharge Your Productivity
                <span className="block text-orange-500">
                  With AI-Driven Dictation
                </span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Incremental audio slicing + intelligent post-processing produce
                accurate, well-formatted text in seconds — then copy it
                anywhere.
              </p>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <TranscriptionDemo />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Speech  className="h-6 w-6"  />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Your Words, Spelled Your Way.
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  Add custom names or special terms to your personal dictionary,
                  and the app will always spell them correctly.
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Cloud className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Works Right From Your Browser.
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  No installation needed. Start recording, speak freely, and get
                  polished text wherever you are.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Ready to Start Dictating?
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Skip the slow, traditional transcription tools. Our app
                processes your speech in slices, merges them with AI, and
                delivers clean text in seconds—so you can focus on your ideas,
                not typing.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
