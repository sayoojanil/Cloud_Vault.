import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  Upload,
  FolderLock,
  ArrowRight,
  Check,
  Fingerprint,
  Cloud,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';

const features = [
  {
    icon: FolderLock,
    title: 'Secure Storage',
    description:
      'Store passports, licenses, insurance cards, and sensitive documents in one secure location.',
  },
  {
    icon: Upload,
    title: 'Easy Uploads',
    description:
      'Drag and drop files or click to upload. Supports PDF, JPG, and PNG formats.',
  },
  {
    icon: Eye,
    title: 'Quick Preview',
    description:
      'Preview documents instantly without downloading. View metadata and notes at a glance.',
  },
];

const securityFeatures = [
  'AES-256 encryption at rest',
  'TLS 1.3 encryption in transit',
  'Zero-knowledge architecture',
  'SOC 2 Type II certified',
  'GDPR compliant',
  'Automatic backups',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-black text-white text-xs font-medium mb-6">
              <Lock className="w-3.5 h-3.5" />
              <span>Best security for your personal documents</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Your personal data,
              <br />
              <span className="text-muted-foreground">
                protected forever.
              </span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Securely store and manage your most important documents.
              Passports, licenses, insurance cards, and more — all encrypted and
              always accessible.
            </p>

            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/signup">
                  <Button size="lg" className="gap-2 px-8">
                    Create your account
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/dashboard">
                  <Button  size="lg" className="gap-2 px-8 rounded-full">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/documents">
                  <Button className='rounded-full' variant="outline" size="lg">
                    View Documents
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Hero Visual (REAL INFO – NO SKELETON) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="vault-card p-4 shadow-vault-xl">
              <div className=" bg-vault-surface rounded-md flex items-center justify-center">
                <div className="w-full h-full p-6 md:p-10 grid grid-cols-1 sm:grid-cols-3 gap-4">

                  <div className="vault-card p-5 text-center">
                    <Lock className="w-10 h-10 mx-auto mb-3 text-primary" />
                    <h4 className="font-semibold mb-1">
                      Encrypted Storage
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Military-grade AES-256 encryption for all files.
                    </p>
                  </div>

                  <div className="vault-card p-5 text-center">
                    <Fingerprint className="w-10 h-10 mx-auto mb-3 text-primary" />
                    <h4 className="font-semibold mb-1">
                      Private Access
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Zero-knowledge security — only you can view documents.
                    </p>
                  </div>

                  <div className="vault-card p-5 text-center">
                    <Cloud className="w-10 h-10 mx-auto mb-3 text-primary" />
                    <h4 className="font-semibold mb-1">
                      Cloud Sync
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Secure access across devices anytime.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-vault-surface">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold mb-4"
            >
              Everything you need to stay organized
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-muted-foreground max-w-xl mx-auto"
            >
              A complete solution for managing personal documents securely.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="vault-card-hover p-6"
              >
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500 text-white text-xs font-medium mb-6">
              <Shield className="w-4 h-4" />
              Bank-level security
            </div>

            <h2 className="text-3xl font-bold mb-4">
              Your security is our priority
            </h2>

            <p className="text-muted-foreground mb-8">
              We use the same standards trusted by financial institutions.
              Your documents are encrypted, backed up, and fully private.
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              {securityFeatures.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="vault-card p-8 bg-green-500 text-primary-foreground"
          >
            <Lock className="w-16 h-16 mb-6 opacity-80" />
            <h3 className="text-2xl font-bold mb-2">
              Zero-Knowledge Architecture
            </h3>
            <p className="opacity-80">
              Even our team cannot access your documents. Privacy by design.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
