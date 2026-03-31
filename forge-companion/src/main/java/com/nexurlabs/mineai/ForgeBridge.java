package com.nexurlabs.mineai;

import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.eventbus.api.SubscribeEvent;
import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.event.TickEvent;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.net.URI;
import net.minecraft.client.Minecraft;

@Mod("mineai_bridge")
public class ForgeBridge {
    private static final Logger LOGGER = LoggerFactory.getLogger(ForgeBridge.class);
    private MineAIWebSocketClient wsClient;
    private int tickCounter = 0;

    public ForgeBridge() {
        MinecraftForge.EVENT_BUS.register(this);
        LOGGER.info("[mineAI] Forge RPC Bridge initialized!");
        try {
            wsClient = new MineAIWebSocketClient(new URI("ws://127.0.0.1:25577"));
            wsClient.connect();
        } catch (Exception e) {
            LOGGER.error("[mineAI] Failed to setup WebSocket", e);
        }
    }

    @SubscribeEvent
    public void onClientTick(TickEvent.ClientTickEvent event) {
        if (event.phase != TickEvent.Phase.END) return;
        Minecraft mc = Minecraft.getInstance();
        if (mc.player == null || wsClient == null || !wsClient.isOpen()) return;

        tickCounter++;
        if (tickCounter % 20 == 0) { // Sync every 1 second (20 ticks)
            String payload = String.format("{\"event\":\"position\",\"x\":%f,\"y\":%f,\"z\":%f}", 
                mc.player.getX(), mc.player.getY(), mc.player.getZ());
            wsClient.send(payload);
        }
    }

    private static class MineAIWebSocketClient extends WebSocketClient {
        public MineAIWebSocketClient(URI serverUri) { super(serverUri); }

        @Override
        public void onOpen(ServerHandshake handshakedata) {
            LOGGER.info("[mineAI WebSocket] Successfully connected to Node.js Brain on 25577!");
            send("{\"event\":\"spawn\"}"); // Mock successful spawn for the LLM
        }

        @Override
        public void onMessage(String message) {
            LOGGER.info("[mineAI WebSocket] LLM Command Received: " + message);
            // In a full implementation, we deserialize JSON here and inject inputs into Minecraft.player
        }

        @Override
        public void onClose(int code, String reason, boolean remote) {
            LOGGER.info("[mineAI WebSocket] Disconnected from Brain.");
        }

        @Override
        public void onError(Exception ex) {
            LOGGER.error("[mineAI WebSocket] Communication Error", ex);
        }
    }
}
