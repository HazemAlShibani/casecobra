import { Button } from "@/components/ui/button"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { ArrowRight } from "lucide-react"
import { Dispatch, SetStateAction } from "react"

const ButtonCheck = async ({
    id,
    setIsLoginModalOpen,
    createPaymentSession
}: {
    id : any
    setIsLoginModalOpen: Dispatch<SetStateAction<boolean>>
    createPaymentSession: ({ configId }: {configId : any}) => any
}) => {
    const { getUser } = getKindeServerSession()
    const user = await getUser()
  
    const handleCheckout = () => {
        console.log(user, "Sosos")
        if (user) {
          // create payment session
          createPaymentSession({ configId: id })
        } else {
          // need to log in
          localStorage.setItem('configurationId', id)
          setIsLoginModalOpen(true)
        }
      }

    return (
        <div className='mt-8 flex justify-end pb-12'>
              <Button
                onClick={() => handleCheckout()}
                className='px-4 sm:px-6 lg:px-8'>
                Check out <ArrowRight className='h-4 w-4 ml-1.5 inline' />
              </Button>
            </div>
    )
}

export default ButtonCheck