import jade.core.Agent;
import jade.core.behaviours.CyclicBehaviour;

/**
 * Created by maxpoon on 26/10/16.
 */


public class elderlyAgent extends Agent {
    private int mode;
    private int positionX;
    private int getPositionY;
    private String targetAgent;
    protected void setup(String nickname){
        System.out.println("Initialize elderly Agent");
        AID id = newAID(nickname, AID.ISLOCALNAME);
        addBehaviour(new routing());
    }
    protected void takeDown() {
        System.out.println("Agent "+getAID().getName()+" terminating.");
    }
    private class routing extends CyclicBehaviour {
        public void action(){
            if(mode==1){

            }
            else if(mode==2){
                
            }
        }
    }
}