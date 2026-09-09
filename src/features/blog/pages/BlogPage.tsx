import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, ArrowRight, Search, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useI18n } from '../../../context/I18nContext';
import { Button } from '../../../shared/ui/Button';
import { PageHero, HERO_TONES } from '../../../shared/ui/PageHero';
import { Card, CardMedia, CardContent } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { Dropdown, type SelectOption } from '../../../shared/ui/Dropdown';
import { ROUTES } from '../../../shared/constants';
import { useApiCollection } from '../../../shared/hooks/useApiCollection';

const categories: SelectOption[] = [
  { value: 'all', label: 'All Articles' },
  { value: 'cost-guides', label: 'Cost Guides' },
  { value: 'how-to', label: 'How-To Guides' },
  { value: 'market-insights', label: 'Market Insights' },
  { value: 'project-stories', label: 'Project Stories' },
  { value: 'regulations', label: 'Regulations & Permits' },
  { value: 'sustainability', label: 'Sustainability' },
];

const videos = [
  { title: 'How UJENZI 25 Works', description: 'A 2-minute overview of our construction, real estate and hospitality services.', thumbnail: '/images/hero/blog.webp', duration: '2:14', url: '#' },
  { title: 'From Blueprint to Building', description: 'Watch a residential project come to life from consultation to delivery.', thumbnail: '/images/hero/construction.webp', duration: '4:05', url: '#' },
  { title: 'Inside Our Materials Marketplace', description: 'A quick tour of how to source verified building materials.', thumbnail: '/images/hero/consultation.webp', duration: '1:48', url: '#' },
];

export const BlogPage = () => {
  const { t } = useI18n();
  const { slug } = useParams();
  const { items: articles } = useApiCollection<any>('/blogPosts');
  const articleRecords = articles.map((article, index) => ({
    ...article,
    publishedAt: article.publishedAt || article.date,
    readTime: article.readTime || article.readingTime,
    featured: article.featured ?? index < 2,
  }));
  const selectedArticle = slug ? articleRecords.find((article) => article.slug === slug) : undefined;
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;

  const filteredArticles = articleRecords.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (slug && selectedArticle) {
    return (
      <article className="min-h-screen bg-gray-50">
        <div className="container py-16 lg:py-24 max-w-4xl">
          <Link to={ROUTES.BLOG} className="text-sm font-medium text-primary hover:underline">Back to all articles</Link>
          <Badge variant="primary" className="mt-8 mb-4">{selectedArticle.category.replace('-', ' ')}</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-text mb-5">{selectedArticle.title}</h1>
          <p className="text-text-secondary mb-8">By {selectedArticle.author} · {selectedArticle.readTime} min read · {selectedArticle.publishedAt}</p>
          <CardMedia src={selectedArticle.image} alt={selectedArticle.title} aspectRatio="16/9" className="mb-8" />
          <div className="prose max-w-none text-lg leading-relaxed text-text-secondary">
            <p>{selectedArticle.content}</p>
            <p className="mt-6">For a project-specific assessment, speak with the UJENZI 25 team so your drawings, quantities, approvals, and delivery plan are coordinated from the beginning.</p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="min-h-screen">
            <PageHero
        tone={HERO_TONES.secondary}
        eyebrow="Construction Tips & Market Insights"
        title={t('blog.title')}
        subtitle={t('blog.subtitle')}
        image={{ src: '/images/hero/blog.webp', alt: 'Construction knowledge and insights' }}
      >
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="input border-white/20 bg-white/10 pl-10 text-white placeholder-white/60 focus:border-primary"
            />
          </div>
          <Dropdown
            options={categories}
            value={selectedCategory}
            onChange={(val) => { setSelectedCategory(val); setCurrentPage(1); }}
            placeholder={t('common.filter')}
            className="w-48"
          />
        </div>
      </PageHero>

      <section className="section bg-gray-50">
        <div className="container">
          {articleRecords.find(a => a.featured) && (
            <div className="mb-12">
              <h2 className="page-title mb-6">Featured Articles</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {articleRecords.filter(a => a.featured).map((article) => (
                  <Link key={article.id} to={`/blog/${article.slug}`} className="card-hover group">
                    <Card className="h-full flex">
                      <CardMedia
                        src={article.image}
                        alt={article.title}
                        aspectRatio="1/1"
                        className="lg:w-64 lg:h-auto lg:rounded-xl lg:mr-6 flex-shrink-0"
                      />
                      <CardContent className="p-4 lg:p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="primary" className="text-xs capitalize">{article.category.replace('-', ' ')}</Badge>
                          <Badge variant="secondary" className="text-xs">{article.readTime} min read</Badge>
                        </div>
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-text-secondary text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                        <div className="flex items-center gap-4 text-sm text-text-muted">
                          <span className="flex items-center gap-1">{article.author}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="page-title">Latest Articles</h2>
              <p className="page-subtitle">{filteredArticles.length} articles found</p>
            </div>
            <Dropdown
              options={categories}
              value={selectedCategory}
              onChange={val => { setSelectedCategory(val); setCurrentPage(1); }}
              placeholder={t('common.filter')}
              className="w-48"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedArticles.map((article) => (
              <Link key={article.id} to={`/blog/${article.slug}`} className="card-hover group">
                <Card className="h-full flex flex-col">
                  <CardMedia
                    src={article.image}
                    alt={article.title}
                    aspectRatio="16/10"
                  />
                  <CardContent className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="primary" className="text-xs capitalize">{article.category.replace('-', ' ')}</Badge>
                      <Badge variant="secondary" className="text-xs">{article.readTime} min read</Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2 flex-1">
                      {article.title}
                    </h3>
                    <p className="text-text-secondary text-sm mb-4 line-clamp-2 flex-1">{article.excerpt}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-3 text-sm text-text-muted">
                        <span className="flex items-center gap-1">{article.author}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="p-0">{t('common.readMore')}<ArrowRight className="w-4 h-4 ml-1" /></Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-text-muted mb-4" />
              <p className="text-text-secondary">No articles found matching your criteria</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10 h-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Videos / Media */}
      <section className="section">
        <div className="container">
          <div className="page-header text-center">
            <h2 className="page-title">Watch & Learn</h2>
            <p className="page-subtitle">Short videos and documentaries about our services and projects</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <a key={index} href={video.url} target="_blank" rel="noopener noreferrer" className="card-hover group block">
                <div className="relative overflow-hidden rounded-2xl">
                  <img src={video.thumbnail} alt={video.title} className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/20">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg transition-transform group-hover:scale-110">
                      <Play className="h-7 w-7 fill-current" />
                    </span>
                  </div>
                  <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white">{video.duration}</span>
                </div>
                <div className="mt-3">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{video.title}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{video.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-gray-50">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-text mb-4">Stay Updated</h2>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            Get the latest construction insights, cost guides, and market trends delivered to your inbox.
          </p>
          <form className="max-w-md mx-auto flex gap-2" onSubmit={e => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="input flex-1"
            />
            <Button type="submit" className="whitespace-nowrap">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};