import React from 'react';
import { Link } from 'react-router-dom';
import { Filter, Image, ArrowRight, Award } from 'lucide-react';
import { useI18n } from '../../../context/I18nContext';
import { Button } from '../../../shared/ui/Button';
import { PageHero, HERO_TONES } from '../../../shared/ui/PageHero';
import { Card, CardMedia, CardContent } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { Dropdown, type SelectOption } from '../../../shared/ui/Dropdown';
import { ROUTES } from '../../../shared/constants';
import { useApiCollection } from '../../../shared/hooks/useApiCollection';

const categories: SelectOption[] = [
  { value: 'all', label: 'All Projects' },
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'institutional', label: 'Institutional' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'renovation', label: 'Renovation' },
];

const stats = [
  { label: 'Projects Completed', value: '200+' },
  { label: 'Cities Served', value: '15+' },
  { label: 'Awards Won', value: '12' },
  { label: 'Repeat Clients', value: '85%' },
];

export const PortfolioPage = () => {
  const { t } = useI18n();
  const { items: projects } = useApiCollection<any>('/projects');
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const projectRecords = projects.map((project) => ({
    ...project,
    image: project.image || project.completedImage,
  }));

  const filteredProjects = selectedCategory === 'all'
    ? projectRecords
    : projectRecords.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen">
            <PageHero
        tone={HERO_TONES.indigo}
        eyebrow="Our Project Portfolio"
        title={t('portfolio.title')}
        subtitle={t('portfolio.subtitle')}
        image={{ src: '/images/hero/portfolio.webp', alt: 'Completed construction projects showcase' }}
        stats={stats}
      />

      <section className="section bg-gray-50">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="page-title">{t('portfolio.allProjects')}</h2>
              <p className="page-subtitle">{filteredProjects.length} projects found</p>
            </div>
            <Dropdown
              options={categories}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder={t('common.filter')}
              className="w-48"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link key={project.id} to={`/portfolio/${project.id}`} className="card-hover group">
                <Card className="h-full">
                  <CardMedia
                    src={project.image}
                    alt={project.title}
                    aspectRatio="16/10"
                  />
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="primary" className="text-xs capitalize">{project.category}</Badge>
                      {project.featured && (
                        <Badge variant="warning" className="text-xs">
                          <Award className="w-3 h-3 mr-1" /> Featured
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-sm text-text-secondary flex items-center gap-1 mb-2">
                      <Image className="w-3.5 h-3.5" /> {project.location}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-text-muted">
                      <span>{project.year}</span>
                      <span>{project.area}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 mx-auto text-text-muted mb-4" />
              <p className="text-text-secondary">No projects found for this category</p>
            </div>
          )}
        </div>
      </section>

      <section className="section gradient-primary-bg">
        <div className="container text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Have a Project in Mind?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Let's discuss how we can bring your vision to life with our expertise and experience.
          </p>
          <Link to={ROUTES.CONSULTATION_REQUEST}>
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 px-8">
              Start a Consultation
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};