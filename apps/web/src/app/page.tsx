import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              맛있는 레시피를
              <br />
              공유하세요
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Recipe Share에서 전 세계의 맛있는 레시피를 발견하고,
              <br />
              나만의 특별한 레시피를 공유해보세요.
            </p>
            <div className="flex gap-4">
              <Link href="/recipes" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                레시피 둘러보기
              </Link>
              <Link href="/auth/register" className="btn-outline border-white text-white hover:bg-white/10">
                시작하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Recipe Share의 특별한 기능
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              href="/recipes/new"
              icon="📝"
              title="쉬운 레시피 작성"
              description="단계별 사진과 함께 누구나 쉽게 레시피를 작성할 수 있어요."
            />
            <FeatureCard
              href="/recipes"
              icon="🔍"
              title="스마트 검색"
              description="재료, 카테고리, 조리 시간으로 원하는 레시피를 빠르게 찾아보세요."
            />
            <FeatureCard
              href="/auth/login"
              icon="❤️"
              title="좋아요 & 저장"
              description="마음에 드는 레시피를 저장하고 나만의 컬렉션을 만들어보세요."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="card p-6 text-center block hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
}
