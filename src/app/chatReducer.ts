import {ChatItems} from "../interface/chatList";
import {AppThunk} from "../utils/appThunk";
import {getChatList, getMessage} from "../api/chat";
import {AxiosError} from "axios";
import {setAppErrorAC, setAppStatusAC} from "./appReducer";
import {IMessage} from "../interface/message";
import {v1} from "uuid";

export type ChatStateType = typeof appState

const appState = {
    chats: [] as ChatItems[],
    messages: [] as IMessage[],
    chat_id: '',
    userID:"c104bb72-34b5-48ba-9ad8-8307c405587d"
}

export type ChatActionsType =
    | ReturnType<typeof setAppChatAC>
    | ReturnType<typeof setMessagesAC>
    | ReturnType<typeof setChatIdAC>
    | ReturnType<typeof setMyMessageAC>


export const chatReducer = (
    state: ChatStateType = appState,
    action: ChatActionsType
): ChatStateType => {
    switch (action.type) {
        case 'APP/SET-CHAT-ITEMS': {
            return {...state, chats: action.ChatItems}
        }
        case "APP/SET-MESSAGES-ITEMS": {
            return {...state, messages: action.Messages.reverse()}
        }
        case "APP/SET-CHAT-ID": {
            return {...state, chat_id: action.chatId}
        }
        case "APP/SET-MY-MESSAGE": {
            const oldMessage = state.messages.map((el)=>el.is_new ? {...el,is_new:false} : el)
            return {
                ...state,messages: [...oldMessage,{message:action.myMessage,user:{id:state.userID,you:true,surname:'',name:'',avatar:""},id:v1(),created_at:Number(new Date()),is_new:true}]
            }
        }
        default:
            return state
    }
}


export const setAppChatAC = (ChatItems: ChatItems[]) => {
    return {type: 'APP/SET-CHAT-ITEMS', ChatItems} as const
}
export const setMessagesAC = (Messages: IMessage[]) => {
    return {type: 'APP/SET-MESSAGES-ITEMS', Messages} as const
}
export const setChatIdAC = (chatId: string) => {
    return {type: 'APP/SET-CHAT-ID', chatId} as const
}
export const setMyMessageAC = (myMessage: string) => {
    return {type: 'APP/SET-MY-MESSAGE', myMessage} as const
}

export const ChatTC = (): AppThunk => dispatch => {
    dispatch(setAppStatusAC('progress'))
    getChatList().then((res) => {
        dispatch(setAppErrorAC('success'))
        dispatch(setAppChatAC(res.data.response))
        dispatch(setAppStatusAC('success'))
    }).catch((reason: AxiosError<{ error: string }>) => {
        if (reason.response?.data) {
            dispatch(setAppStatusAC('error'))
        } else {
            dispatch(setAppStatusAC('error'))
        }
    })
}

export const MessageTC = (): AppThunk => (dispatch, getState) => {
    const id = getState().chat.chat_id

    dispatch(setAppStatusAC('progress'))

    getMessage(id).then((res) => {
        dispatch(setAppErrorAC('success'))
        dispatch(setMessagesAC(res.data.response))
        dispatch(setAppStatusAC('success'))
    }).catch((reason: AxiosError<{ error: string }>) => {
        if (reason.response?.data) {
            dispatch(setAppStatusAC('error'))
        } else {
            dispatch(setAppStatusAC('error'))
        }
    })
}