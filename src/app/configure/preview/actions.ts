'use server'

import OrderReceivedEmail from '@/components/email/OrderReceivedEmail'
import { BASE_PRICE, PRODUCT_PRICES } from '@/config/products'
import { db } from '@/db'
import { stripe } from '@/lib/stripe'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { Order } from '@prisma/client'
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_EMAIL_KEY) 

export const createCheckoutSession = async ({
  configId,
}: {
  configId: string
}) => {
    
  const configuration = await db.configuration.findUnique({
    where: { id: configId },
  })

  if (!configuration) {
    throw new Error('No such configuration found')
  }

  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user) {
    throw new Error('You need to be logged in')
  }

  const { finish, material } = configuration

  let price = BASE_PRICE
  if (finish === 'textured') price += PRODUCT_PRICES.finish.textured
  if (material === 'polycarbonate')
    price += PRODUCT_PRICES.material.polycarbonate

  
  let order: Order | undefined = undefined
  
  const existingOrder = await db.order.findFirst({
    where: {
      userId: user.id,
      configurationId: configuration.id,
    },
  })

  console.log(user.id, configuration.id)

  if (existingOrder) {
    order = existingOrder
  } else {
    order = await db.order.create({
      data: {
        amount: price / 100,
        userId: user.id,
        configurationId: configuration.id,
      },
    })
  }

  let information = {
    name: "Shipping Product",
    city: "Damascus",
    country: "Syria",
    postalCode: "12345",
    street: "Jaramana",
    state: "WoW",
  }

  const updatedOrder = await db.order.update({
    where: {
      id: order.id,
    },
    data: {
      isPaid: true,
      shippingAddress: {
        create: {
          ...information
        },
      },
      billingAddress: {
        create: {
          ...information
        },
      },
    },
  })

  // const product = await stripe.products.create({
  //   name: 'Custom iPhone Case',
  //   images: [configuration.imageURL],
  //   default_price_data: {
  //     currency: 'USD',
  //     unit_amount: price,
  //   },
  // })

  // const stripeSession = await stripe.checkout.sessions.create({
  //   success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
  //   cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/configure/preview?id=${configuration.id}`,
  //   payment_method_types: ['card', 'paypal'],
  //   mode: 'payment',
  //   shipping_address_collection: { allowed_countries: ['DE', 'US','NE'] },
  //   /*
  //   We need to know here after the product is payed is
  //   whom does this and which the order is payed 
  //    */
  //   metadata: {
  //     userId: user.id,
  //     orderId: order.id,
  //   },
    
  //   line_items: [{ price: product.default_price as string, quantity: 1 }],
  // })
  let id = updatedOrder!.id

  console.log(user!.email!)

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: [user!.email!],
    subject: 'Thanks for your order!',
    react: OrderReceivedEmail({
      id,
      orderDate: updatedOrder.createdAt.toLocaleDateString(),
      //@ts-ignore
      shippingAddress: {
        ...information
      },
    }),
  })


  return { url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}` }
  // return { url: stripeSession.url }
}