import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider
} from "@/components/ui/tooltip"
import { useState } from "react"
import { FaPlus } from "react-icons/fa"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,

} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import Lottie from "lottie-react";
import { animationDefaultOptions } from "../../../../../../lib/utils";
import { HOST, SEARCH_CONTACTS_ROUTES } from "../../../../../../utils/constants";
import apiClient from "@/lib/api-client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "../../../../../../lib/utils";
import { useAppStore } from "../../../../../../store";


const NewDM = () => {

    const {setSelectedChatType, setSelectedChatData} = useAppStore();

    const [openNewContactModel, setOpenNewContactModel] = useState(false);
    const [searchedContacts, setSearchedContacts] = useState([]);
    const serchContacts = async (searchTerm) => {
        try {
            if (searchTerm.length > 0) {
                const response = await apiClient.post(
                    SEARCH_CONTACTS_ROUTES,
                    { searchTerm },
                    { withCredentials: true }
                );
                if (response.status === 200 && response.data.contacts) {
                    setSearchedContacts(response.data.contacts);
                }
            } else {
                setSearchedContacts([]);
            }

        } catch (error) {
            console.log(error);
        }
    }

    const selectNewContact = (contact)=>{
        setOpenNewContactModel(false);
        setSelectedChatType("contact");
        setSelectedChatData(contact);
        setSearchedContacts([]);

    }
    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <FaPlus className="text-neutral-400 text-opacity-90 text-small hover:text-neutral-100 cursor-pointer transition-all duration-300"
                            onClick={() => setOpenNewContactModel(true)} />
                    </TooltipTrigger>
                    <TooltipContent
                        className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
                        <p>Select New Contact</p>
                    </TooltipContent>

                </Tooltip>
            </TooltipProvider>

            <Dialog open={openNewContactModel} onOpenChange={setOpenNewContactModel}>

                <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Please select a contact</DialogTitle>
                        <DialogDescription>

                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <Input placeholder="Search Contacts" className="rounded-lg p-6 bg-[#2c2e3b] border-none"
                            onChange={e => serchContacts(e.target.value)} />
                    </div>
                    {
                        searchedContacts.length > 0  && (

                        
                    <ScrollArea className="h-[250px]">
                        <div className="flex flex-col gap-5">
                            {
                                searchedContacts.map(contact => <div key={contact._id} className="flex gap-3 items-center cursor-pointer"
                                onClick={()=>selectNewContact(contact)}>

                                    <div className="w-12 h-12 relative">
                                        <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                                            {
                                                contact.image ? (<AvatarImage src={`${HOST}/${contact.image}`} alt="profile" className="object-cover rounded-full w-full h-full bg-black" />) :
                                                    (<div className={`uppercase h-12 w-12  text-lg border-[1px] flex items-center justify-center rounded-full text-white ${getColor(contact.color)}`}>
                                                        {contact.firstName ? contact.firstName.split("").shift() : contact.email.split("").shift()}
                                                    </div>
                                                    )}
                                        </Avatar>
                                    </div>
                                    <div className="flex flex-col">
                                        <span>{
                                            contact.firstName && contact.lastName ? `${contact.firstName} ${contact.lastName}` : contact.email
                                        }
                                        </span>
                                        <span className="text-xs">
                                            {contact.email}
                                        </span>
                                    </div>


                                </div>)
                            }

                        </div>
                    </ScrollArea>
                    )}

                    {searchedContacts.length <= 0 && (
                        <div className="flex-1 flex flex-col justify-center items-center gap-5 mt-[-30px]">
                            <div className="relative w-24 h-24">
                                <div className="w-24 h-24 rounded-full bg-purple-500/20 animate-ping absolute" />
                                <div className="w-24 h-24 rounded-full bg-purple-500/30 flex items-center justify-center">
                                    <span className="text-4xl">💬</span>
                                </div>
                            </div>
                            <div className="text-white text-center">
                                <h3 className="text-2xl font-medium">
                                    Hi<span className="text-purple-500">!</span> Search new
                                    <span className="text-purple-500"> Contact.</span>
                                </h3>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}

export default NewDM
