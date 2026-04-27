# Quick Performance Checklist

Use this checklist when adding new features to maintain optimal performance.

## Before Deploying

### Images
- [ ] All images use Next.js `<Image>` component
- [ ] `sizes` attribute specified for responsive images
- [ ] `priority` only on above-the-fold images
- [ ] Images hosted on Supabase Storage or optimized CDN
- [ ] Image dimensions specified when possible

### Data Fetching
- [ ] Server Components used for data fetching when possible
- [ ] Independent queries run in parallel with `Promise.all`
- [ ] Expensive queries wrapped with React `cache()`
- [ ] `revalidate` set appropriately (not `force-dynamic`)
- [ ] Loading states added for async operations

### Code Splitting
- [ ] Heavy components lazy loaded with `dynamic()`
- [ ] Admin pages don't bloat public bundle
- [ ] Third-party libraries imported selectively
- [ ] Unused dependencies removed

### Caching
- [ ] Static pages use ISR or SSG when possible
- [ ] API routes have appropriate cache headers
- [ ] Database queries deduplicated with React cache
- [ ] Browser caching configured for static assets

### Bundle Size
- [ ] Run `npm run build` and check bundle sizes
- [ ] No duplicate dependencies
- [ ] Tree-shaking working correctly
- [ ] Icons imported individually, not entire library

### Testing
- [ ] Test on slow 3G network
- [ ] Run Lighthouse audit (score > 90)
- [ ] Check Core Web Vitals
- [ ] Test on mobile device
- [ ] Verify no console errors

## Quick Wins

### If Page is Slow
1. Check if using `force-dynamic` (remove if possible)
2. Add `revalidate` for static-ish content
3. Parallelize database queries
4. Add loading skeleton
5. Optimize images with proper `sizes`

### If Bundle is Large
1. Use `dynamic()` for heavy components
2. Check for duplicate dependencies
3. Import only what you need from libraries
4. Split admin code from public code

### If Images are Slow
1. Ensure using Next.js Image component
2. Add `sizes` attribute
3. Use appropriate image formats (WebP)
4. Compress images before upload
5. Use CDN for image delivery

## Performance Budget

Stay within these limits:

| Metric | Target | Max |
|--------|--------|-----|
| LCP | < 2.0s | 2.5s |
| FID | < 50ms | 100ms |
| CLS | < 0.05 | 0.1 |
| TTFB | < 300ms | 600ms |
| Bundle Size | < 200KB | 300KB |
| Image Size | < 100KB | 200KB |

## Common Mistakes to Avoid

❌ Using `force-dynamic` globally  
✅ Use `revalidate` or ISR instead

❌ Sequential database queries  
✅ Use `Promise.all` for parallel queries

❌ No loading states  
✅ Add skeleton loaders

❌ Images without `sizes` attribute  
✅ Specify responsive sizes

❌ Client components for static content  
✅ Use Server Components when possible

❌ Importing entire icon libraries  
✅ Import individual icons

❌ No image optimization  
✅ Use Next.js Image component

❌ Fetching data in useEffect  
✅ Fetch in Server Components or use SWR/React Query

## Resources

- [Next.js Performance Docs](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web.dev Performance](https://web.dev/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
