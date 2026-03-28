import { useReveal } from "@/hooks/use-reveal"
import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"

const API_URL = "https://functions.poehali.dev/aa0535ec-d495-404b-a4d9-80f1e41e8def"

const CATEGORIES = ["Все", "Торговля и сервис", "Строительство и ремонт", "Доставка и логистика", "Офис и IT"]

interface Vacancy {
  id: number
  title: string
  category: string
  company: string
  salary: string
  employment_type: string
}

export function WorkSection() {
  const { ref, isVisible } = useReveal(0.3)
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("Все")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams()
    if (activeCategory !== "Все") params.set("category", activeCategory)
    if (search) params.set("search", search)

    setLoading(true)
    fetch(`${API_URL}?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setVacancies(data.vacancies || []))
      .finally(() => setLoading(false))
  }, [activeCategory, search])

  return (
    <section
      ref={ref}
      className="flex h-screen w-screen shrink-0 snap-start flex-col justify-center px-6 pt-20 md:px-12 md:pt-0 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div
          className={`mb-6 transition-all duration-700 md:mb-8 ${
            isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
          }`}
        >
          <h2 className="mb-2 font-sans text-4xl font-light tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Вакансии
          </h2>
          <p className="font-mono text-sm text-foreground/60 md:text-base">/ Актуальные предложения</p>
        </div>

        {/* Search */}
        <div
          className={`mb-4 transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "150ms" }}
        >
          <div className="relative max-w-md">
            <Icon name="Search" size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск вакансий..."
              className="w-full border-b border-foreground/30 bg-transparent py-1.5 pl-6 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Category filters */}
        <div
          className={`mb-6 flex flex-wrap gap-2 transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full border px-3 py-1 font-mono text-xs transition-all duration-200 ${
                activeCategory === cat
                  ? "border-foreground/60 bg-foreground/15 text-foreground"
                  : "border-foreground/20 text-foreground/50 hover:border-foreground/40 hover:text-foreground/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Vacancies list */}
        <div className="space-y-3 overflow-y-auto" style={{ maxHeight: "45vh" }}>
          {loading ? (
            <p className="font-mono text-sm text-foreground/40">Загружаем вакансии...</p>
          ) : vacancies.length === 0 ? (
            <p className="font-mono text-sm text-foreground/40">Вакансий не найдено</p>
          ) : (
            vacancies.map((v, i) => (
              <div
                key={v.id}
                className={`group flex items-center justify-between border-b border-foreground/10 py-3 transition-all duration-700 hover:border-foreground/30 ${
                  isVisible ? "translate-x-0 opacity-100" : "-translate-x-16 opacity-0"
                }`}
                style={{ transitionDelay: `${300 + i * 80}ms` }}
              >
                <div className="flex items-baseline gap-4 md:gap-8">
                  <span className="font-mono text-xs text-foreground/30">0{i + 1}</span>
                  <div>
                    <h3 className="font-sans text-lg font-light text-foreground transition-transform duration-300 group-hover:translate-x-1 md:text-2xl">
                      {v.title}
                    </h3>
                    <p className="font-mono text-xs text-foreground/50">{v.company} · {v.employment_type}</p>
                  </div>
                </div>
                <span className="font-mono text-xs text-foreground/60 md:text-sm">{v.salary}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
