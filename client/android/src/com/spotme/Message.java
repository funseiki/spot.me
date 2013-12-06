package com.spotme;

import org.apache.http.HttpEntity;

public class Message {

	private String type;
	private String url;
	private HttpEntity entity;

	public Message(String type, String url, HttpEntity entity) {
		setType(type);
		setUrl(url);
		setEntity(entity);
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public HttpEntity getEntity() {
		return entity;
	}

	public void setEntity(HttpEntity entity) {
		this.entity = entity;
	}
}