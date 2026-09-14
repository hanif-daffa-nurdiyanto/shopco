import type { Product } from '@/types/product'
import type { Testimonial } from '@/types/testimonial'

const imageRoot = '/images/figma'
const newArrivals: Product[] = [
  {
    id: 'tape-tshirt',
    image: `${imageRoot}/new-tape-tshirt.png`,
    name: 'T-shirt with Tape Details',
    price: 120,
    rating: 4.5,
  },
  {
    id: 'skinny-jeans',
    image: `${imageRoot}/new-skinny-jeans.png`,
    name: 'Skinny Fit Jeans',
    price: 240,
    originalPrice: 260,
    discount: 20,
    rating: 3.5,
  },
  {
    id: 'checkered-shirt',
    image: `${imageRoot}/new-checkered-shirt.png`,
    name: 'Checkered Shirt',
    price: 180,
    rating: 4.5,
  },
  {
    id: 'sleeve-striped',
    image: `${imageRoot}/new-sleeve-striped-tshirt.png`,
    name: 'Sleeve Striped T-shirt',
    price: 130,
    originalPrice: 160,
    discount: 30,
    rating: 4.5,
  },
]
const topSelling: Product[] = [
  {
    id: 'vertical-striped',
    image: `${imageRoot}/top-vertical-striped-shirt.png`,
    name: 'Vertical Striped Shirt',
    price: 212,
    originalPrice: 232,
    discount: 20,
    rating: 5,
  },
  {
    id: 'courage-tshirt',
    image: `${imageRoot}/top-courage-tshirt.png`,
    name: 'Courage Graphic T-shirt',
    price: 145,
    rating: 4,
  },
  {
    id: 'bermuda-shorts',
    image: `${imageRoot}/top-bermuda-shorts.png`,
    name: 'Loose Fit Bermuda Shorts',
    price: 80,
    rating: 3,
  },
  {
    id: 'faded-jeans',
    image: `${imageRoot}/top-faded-jeans.png`,
    name: 'Faded Skinny Jeans',
    price: 210,
    rating: 4.5,
  },
]
const testimonials: Testimonial[] = [
  {
    id: 'sarah',
    name: 'Sarah M.',
    rating: 5,
    quote:
      "I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece has exceeded my expectations.",
  },
  {
    id: 'alex',
    name: 'Alex K.',
    rating: 5,
    quote:
      'Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable.',
  },
  {
    id: 'james',
    name: 'James L.',
    rating: 5,
    quote:
      "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon Shop.co. The selection is diverse and on-point.",
  },
]
const dressStyles = [
  { image: `${imageRoot}/style-casual.png`, name: 'Casual' },
  { image: `${imageRoot}/style-formal.png`, name: 'Formal' },
  { image: `${imageRoot}/style-party.png`, name: 'Party' },
  { image: `${imageRoot}/style-gym.png`, name: 'Gym' },
]

export { dressStyles, imageRoot, newArrivals, testimonials, topSelling }
