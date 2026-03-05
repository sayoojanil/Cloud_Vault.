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

// Text animation variants
const textVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: custom * 0.1,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

const letterVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.2, 0.65, 0.3, 0.9] },
  },
};

const wordVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0.04 },
  },
};

export default function Landing() {
  const { isAuthenticated } = useAuth();

  // Function to split text into characters for animation
  const splitText = (text) => {
    return text.split('').map((char, index) => (
      <motion.span
        key={index}
        variants={letterVariants}
        style={{ display: 'inline-block' }}
      >
        {char === ' ' ? '\u00A0' : char}
      </motion.span>
    ));
  };

  // Function to split text into words for animation
  const splitWords = (text) => {
    return text.split(' ').map((word, index) => (
      <motion.span
        key={index}
        variants={letterVariants}
        style={{ display: 'inline-block', marginRight: '0.25rem' }}
      >
        {word}
      </motion.span>
    ));
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={wordVariants}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-black text-white text-xs font-medium mb-6"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Best security for your personal documents</span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            >
              <motion.span variants={itemVariants} className="inline-block">
                Your personal data,
              </motion.span>
              <br />
              <motion.span 
                variants={itemVariants}
                className="text-muted-foreground inline-block"
              >
                protected forever.
              </motion.span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl mx-auto"
            >
              {splitWords("Securely store and manage your most important documents. Passports, licenses, insurance cards, and more — all encrypted and always accessible.")}
            </motion.p>

            {!isAuthenticated ? (
              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row justify-center gap-4"
              >
                <Link to="/signup">
                  <Button size="lg" className="gap-2 px-8">
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8, duration: 0.3 }}
                    >
                      Create your account
                    </motion.span>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9, duration: 0.3 }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.0, duration: 0.3 }}
                    >
                      Sign In
                    </motion.span>
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row justify-center gap-4"
              >
                <Link to="/dashboard">
                  <Button size="lg" className="gap-2 px-8 rounded-full">
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.3 }}
                    >
                      Go to Dashboard
                    </motion.span>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9, duration: 0.3 }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </Button>
                </Link>
                <Link to="/documents">
                  <Button className='rounded-full' variant="outline" size="lg">
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.0, duration: 0.3 }}
                    >
                      View Documents
                    </motion.span>
                  </Button>
                </Link>
              </motion.div>
            )}
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="vault-card p-4 shadow-vault-xl">
              <div className="bg-vault-surface rounded-md flex items-center justify-center">
                <div className="w-full h-full p-6 md:p-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: Lock, title: 'Encrypted Storage', desc: 'Military-grade AES-256 encryption for all files.' },
                    { icon: Fingerprint, title: 'Private Access', desc: 'Zero-knowledge security — only you can view documents.' },
                    { icon: Cloud, title: 'Cloud Sync', desc: 'Secure access across devices anytime.' }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                      className="vault-card p-5 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.4, type: "spring" }}
                      >
                        <item.icon className="w-10 h-10 mx-auto mb-3 text-primary" />
                      </motion.div>
                      <motion.h4
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                        className="font-semibold mb-1"
                      >
                        {item.title}
                      </motion.h4>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                        className="text-xs text-muted-foreground"
                      >
                        {item.desc}
                      </motion.p>
                    </motion.div>
                  ))}
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
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold mb-4"
            >
              {splitText("Everything you need to stay organized")}
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-muted-foreground max-w-xl mx-auto"
            >
              {splitWords("A complete solution for managing personal documents securely.")}
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                custom={index}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3 }
                }}
                className="vault-card-hover p-6 cursor-pointer"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                  className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-4"
                >
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                  className="font-semibold text-lg mb-2"
                >
                  {feature.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                  className="text-muted-foreground text-sm"
                >
                  {feature.description}
                </motion.p>
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
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500 text-white text-xs font-medium mb-6"
            >
              <Shield className="w-4 h-4" />
              Bank-level security
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold mb-4"
            >
              {splitText("Your security is our priority")}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-muted-foreground mb-8"
            >
              {splitWords("We use the same standards trusted by financial institutions. Your documents are encrypted, backed up, and fully private.")}
            </motion.p>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid sm:grid-cols-2 gap-3"
            >
              {securityFeatures.map((item, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  custom={i}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      delay: 0.4 + i * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 15
                    }}
                    className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.45 + i * 0.05, duration: 0.3 }}
                    className="text-sm"
                  >
                    {item}
                  </motion.span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30, rotateY: -15 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ 
              duration: 0.8,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              transition: { duration: 0.3 }
            }}
            className="vault-card p-8 bg-green-500 text-primary-foreground cursor-pointer"
          >
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -5, 5, 0],
              }}
              transition={{ 
                duration: 1,
                delay: 0.5,
                ease: "easeInOut"
              }}
            >
              <Lock className="w-16 h-16 mb-6 opacity-80" />
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-2xl font-bold mb-2"
            >
              Zero-Knowledge Architecture
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="opacity-80"
            >
              Even our team cannot access your documents. Privacy by design.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}