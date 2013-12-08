package com.spotme;

/**
 * store session data: userId, token, cache, etc
 * 
 * @author jicongw
 * 
 */

public class SpotMeSession {

	private static SpotMeSession session = null;

	private String token;
	private String userId;

	protected SpotMeSession() {
		setToken("");
		setUserId("");
	}

	public static SpotMeSession getSession() {
		if (session == null) {
			session = new SpotMeSession();
		}
		return session;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}
}
